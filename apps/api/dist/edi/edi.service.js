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
var EdiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let EdiService = EdiService_1 = class EdiService {
    prisma;
    logger = new common_1.Logger(EdiService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async parseOrders(ediContent, organizationId) {
        this.logger.log('Parsing EDI ORDERS...');
        const bgmMatch = ediContent.match(/BGM\+220\+([A-Z0-9]+)/);
        const orderNumber = bgmMatch ? bgmMatch[1] : `EDI-${Date.now()}`;
        const dtmMatch = ediContent.match(/DTM\+137:([0-9]+):102/);
        const dateStr = dtmMatch ? dtmMatch[1] : '';
        const issueDate = dateStr ? new Date(`${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`) : new Date();
        await this.prisma.ediLog.create({
            data: {
                organizationId,
                type: 'ORDERS',
                direction: 'IN',
                status: 'SUCCESS',
                content: ediContent
            }
        });
        return { orderNumber, issueDate };
    }
    async generateInvoic(invoiceId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { organization: true, client: true, items: true }
        });
        if (!invoice)
            throw new Error('Invoice not found');
        const orgGln = invoice.organization.gln || 'UNKNOWN_GLN';
        const clientGln = 'BUYER_GLN';
        const date = invoice.issueDate.toISOString().slice(0, 10).replace(/-/g, '');
        let edi = `UNA:+.? '
UNB+UNOC:3+${orgGln}:14+${clientGln}:14+${date}:1000+${invoice.invoiceNumber}'
UNH+1+INVOIC:D:01B:UN:EAN010'
BGM+380+${invoice.invoiceNumber}+9'
DTM+137:${date}:102'
`;
        let lineCount = 1;
        for (const item of invoice.items) {
            edi += `LIN+${lineCount++}++${'EAN_HERE'}:EN'
QTY+47:${item.quantity}:PCE'
MOA+203:${item.totalPrice}'
PRI+AAA:${item.unitPrice}::NTP'
`;
        }
        edi += `UNS+S'
MOA+77:${invoice.totalAmount}'
CNT+2:${lineCount - 1}'
UNT+${lineCount + 10}+1'
UNZ+1+${invoice.invoiceNumber}'`;
        await this.prisma.ediLog.create({
            data: {
                organizationId: invoice.organizationId,
                type: 'INVOIC',
                direction: 'OUT',
                status: 'SUCCESS',
                content: edi
            }
        });
        return edi;
    }
    async getLogs(organizationId) {
        return this.prisma.ediLog.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' }
        });
    }
};
exports.EdiService = EdiService;
exports.EdiService = EdiService = EdiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EdiService);
//# sourceMappingURL=edi.service.js.map