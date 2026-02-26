"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OcrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrService = void 0;
const common_1 = require("@nestjs/common");
const Tesseract = __importStar(require("tesseract.js"));
const isdoc_service_1 = require("../invoices/services/isdoc.service");
let OcrService = OcrService_1 = class OcrService {
    isdocService;
    logger = new common_1.Logger(OcrService_1.name);
    constructor(isdocService) {
        this.isdocService = isdocService;
    }
    async analyzeFile(fileBuffer, mimetype) {
        this.logger.log('Starting Analysis...');
        try {
            const textStart = fileBuffer.slice(0, 100).toString('utf-8');
            if (textStart.includes('<?xml') && textStart.includes('ISDOC')) {
                this.logger.log('Detected ISDOC file, using parser instead of OCR');
                return this.isdocService.parseIsdoc(fileBuffer);
            }
            if (mimetype === 'application/xml' || mimetype === 'text/xml' || (mimetype && mimetype.includes('isdoc'))) {
                return this.isdocService.parseIsdoc(fileBuffer);
            }
        }
        catch (e) {
            this.logger.warn('ISDOC check failed, proceeding to OCR');
        }
        try {
            const worker = await Tesseract.createWorker('eng');
            const { data: { text } } = await worker.recognize(fileBuffer);
            await worker.terminate();
            this.logger.log(`OCR Text: ${text.substring(0, 100)}...`);
            return this.parseText(text);
        }
        catch (error) {
            this.logger.error(`OCR failed: ${error.message}`);
            throw error;
        }
    }
    parseText(text) {
        const result = {};
        const icoMatch = text.match(/\b\d{8}\b/);
        if (icoMatch)
            result.supplierIco = icoMatch[0];
        const dateMatch = text.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
        if (dateMatch) {
            const day = dateMatch[1].padStart(2, '0');
            const month = dateMatch[2].padStart(2, '0');
            const year = dateMatch[3];
            result.issueDate = `${year}-${month}-${day}`;
        }
        const moneyMatches = text.matchAll(/(\d+[\s,.]?\d*[.,]\d{2})/g);
        let maxAmount = 0;
        for (const match of moneyMatches) {
            const clean = match[0].replace(/\s/g, '').replace(',', '.');
            const val = parseFloat(clean);
            if (!isNaN(val) && val > maxAmount) {
                maxAmount = val;
            }
        }
        if (maxAmount > 0)
            result.amount = maxAmount;
        result.category = this.categorize(text);
        return result;
    }
    categorize(text) {
        const lower = text.toLowerCase();
        if (lower.includes('alza') || lower.includes('czc') || lower.includes('datart'))
            return 'Hardware/IT';
        if (lower.includes('shell') || lower.includes('mol') || lower.includes('omv') || lower.includes('benzina'))
            return 'Pohonné hmoty';
        if (lower.includes('adobe') || lower.includes('jetbrains') || lower.includes('aws') || lower.includes('digitalocean'))
            return 'Software/Služby';
        if (lower.includes('restaurace') || lower.includes('potraviny') || lower.includes('lidl') || lower.includes('kaufland'))
            return 'Reprezentace/Občerstvení';
        if (lower.includes('o2') || lower.includes('t-mobile') || lower.includes('vodafone'))
            return 'Telekomunikace';
        return 'Ostatní';
    }
};
exports.OcrService = OcrService;
exports.OcrService = OcrService = OcrService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [isdoc_service_1.IsdocService])
], OcrService);
//# sourceMappingURL=ocr.service.js.map