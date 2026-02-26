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
exports.CashDeskController = void 0;
const common_1 = require("@nestjs/common");
const cash_desk_service_1 = require("./cash-desk.service");
let CashDeskController = class CashDeskController {
    cashDeskService;
    constructor(cashDeskService) {
        this.cashDeskService = cashDeskService;
    }
    create(body) {
        return this.cashDeskService.create(body);
    }
    findAll(organizationId) {
        return this.cashDeskService.findAll(organizationId);
    }
    findOne(id) {
        return this.cashDeskService.findOne(id);
    }
    createTransaction(id, body) {
        return this.cashDeskService.createTransaction(id, body);
    }
    closePeriod(id, body) {
        return this.cashDeskService.closePeriod(id, body.closingDate, body.userId);
    }
    async downloadReceipt(id, res) {
        const buffer = await this.cashDeskService.generateReceiptPdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename=pokladni-doklad-${id}.pdf`,
        });
        res.send(buffer);
    }
};
exports.CashDeskController = CashDeskController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CashDeskController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CashDeskController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CashDeskController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/transactions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CashDeskController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CashDeskController.prototype, "closePeriod", null);
__decorate([
    (0, common_1.Get)('transactions/:id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CashDeskController.prototype, "downloadReceipt", null);
exports.CashDeskController = CashDeskController = __decorate([
    (0, common_1.Controller)('cash-desks'),
    __metadata("design:paramtypes", [cash_desk_service_1.CashDeskService])
], CashDeskController);
//# sourceMappingURL=cash-desk.controller.js.map