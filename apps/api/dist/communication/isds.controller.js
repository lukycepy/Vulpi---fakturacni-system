"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsdsController = void 0;
const common_1 = require("@nestjs/common");
const isds_service_1 = require("./isds.service");
let IsdsController = class IsdsController {
    isdsService;
    constructor(isdsService) {
        this.isdsService = isdsService;
    }
    async checkDataBox(ico) {
        const id = await this.isdsService.findDataBoxId(ico);
        return { dataBoxId: id };
    }
    async sendInvoice(body) {
        return this.isdsService.sendInvoiceToDataBox(body.invoiceId, body.dataBoxId);
    }
};
exports.IsdsController = IsdsController;
__decorate([
    (0, common_1.Post)('check'),
    __param(0, (0, common_1.Body)('ico')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IsdsController.prototype, "checkDataBox", null);
__decorate([
    (0, common_1.Post)('send-invoice'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IsdsController.prototype, "sendInvoice", null);
exports.IsdsController = IsdsController = __decorate([
    (0, common_1.Controller)('isds'),
    __metadata("design:paramtypes", [isds_service_1.IsdsService])
], IsdsController);
//# sourceMappingURL=isds.controller.js.map