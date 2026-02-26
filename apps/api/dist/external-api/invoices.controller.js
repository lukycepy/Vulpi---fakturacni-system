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
exports.ExternalInvoicesController = void 0;
const common_1 = require("@nestjs/common");
const invoices_service_1 = require("../invoices/services/invoices.service");
const create_invoice_dto_1 = require("../invoices/dto/create-invoice.dto");
const api_key_guard_1 = require("../api-keys/api-key.guard");
const swagger_1 = require("@nestjs/swagger");
let ExternalInvoicesController = class ExternalInvoicesController {
    invoicesService;
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    async create(createInvoiceDto, req) {
        createInvoiceDto.organizationId = req.organizationId;
        return this.invoicesService.create(createInvoiceDto);
    }
    async findOne(id) {
        const invoice = await this.invoicesService.findOne(id);
        return invoice;
    }
};
exports.ExternalInvoicesController = ExternalInvoicesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new invoice' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invoice_dto_1.CreateInvoiceDto, Object]),
    __metadata("design:returntype", Promise)
], ExternalInvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get invoice details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExternalInvoicesController.prototype, "findOne", null);
exports.ExternalInvoicesController = ExternalInvoicesController = __decorate([
    (0, swagger_1.ApiTags)('Invoices'),
    (0, swagger_1.ApiSecurity)('x-api-key'),
    (0, common_1.Controller)('api/v1/invoices'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], ExternalInvoicesController);
//# sourceMappingURL=invoices.controller.js.map