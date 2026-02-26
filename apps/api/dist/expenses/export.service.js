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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const fastcsv = __importStar(require("fast-csv"));
const xml2js_1 = require("xml2js");
let ExportService = class ExportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async exportCsv(organizationId, year) {
        const invoices = await this.prisma.invoice.findMany({
            where: {
                organizationId,
                issueDate: {
                    gte: new Date(year, 0, 1),
                    lte: new Date(year, 11, 31),
                },
            },
            include: { client: true },
        });
        const rows = invoices.map(inv => ({
            Cislo: inv.invoiceNumber,
            DatumVystaveni: inv.issueDate.toISOString().split('T')[0],
            Klient: inv.client.name,
            ICO: inv.client.ico,
            CastkaBezDPH: Number(inv.totalAmount) - Number(inv.totalVat),
            DPH: Number(inv.totalVat),
            Celkem: Number(inv.totalAmount),
        }));
        return fastcsv.writeToString(rows, { headers: true });
    }
    async exportPohodaXml(organizationId, year) {
        const invoices = await this.prisma.invoice.findMany({
            where: {
                organizationId,
                issueDate: {
                    gte: new Date(year, 0, 1),
                    lte: new Date(year, 11, 31),
                },
            },
            include: { client: true, items: true },
        });
        const builder = new xml2js_1.Builder();
        const xmlObj = {
            'dat:dataPack': {
                $: {
                    id: "Export",
                    ico: "12345678",
                    application: "Vulpi",
                    version: "2.0",
                    note: "Export faktur",
                    "xmlns:dat": "http://www.stormware.cz/schema/version_2/data.xsd",
                    "xmlns:inv": "http://www.stormware.cz/schema/version_2/invoice.xsd",
                    "xmlns:typ": "http://www.stormware.cz/schema/version_2/type.xsd"
                },
                'dat:dataPackItem': invoices.map(inv => ({
                    $: { version: "2.0", id: inv.id },
                    'inv:invoice': {
                        'inv:invoiceHeader': {
                            'inv:invoiceType': "issuedInvoice",
                            'inv:number': {
                                'typ:numberRequested': inv.invoiceNumber
                            },
                            'inv:date': inv.issueDate.toISOString().split('T')[0],
                            'inv:dateTax': inv.taxableSupplyDate?.toISOString().split('T')[0] || inv.issueDate.toISOString().split('T')[0],
                            'inv:dateDue': inv.dueDate.toISOString().split('T')[0],
                            'inv:partnerIdentity': {
                                'typ:address': {
                                    'typ:company': inv.client.name,
                                    'typ:ico': inv.client.ico,
                                    'typ:dic': inv.client.dic,
                                    'typ:street': inv.client.address
                                }
                            }
                        },
                        'inv:invoiceSummary': {
                            'inv:homeCurrency': {
                                'typ:priceHighSum': Number(inv.totalAmount)
                            }
                        }
                    }
                }))
            }
        };
        return builder.buildObject(xmlObj);
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExportService);
//# sourceMappingURL=export.service.js.map