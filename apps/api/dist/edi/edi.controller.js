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
exports.EdiController = void 0;
const common_1 = require("@nestjs/common");
const edi_service_1 = require("./edi.service");
let EdiController = class EdiController {
    ediService;
    constructor(ediService) {
        this.ediService = ediService;
    }
    parseOrders(body) {
        return this.ediService.parseOrders(body.content, body.organizationId);
    }
    generateInvoic(id) {
        return this.ediService.generateInvoic(id);
    }
    getLogs(organizationId) {
        return this.ediService.getLogs(organizationId);
    }
};
exports.EdiController = EdiController;
__decorate([
    (0, common_1.Post)('orders'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EdiController.prototype, "parseOrders", null);
__decorate([
    (0, common_1.Post)('invoic/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EdiController.prototype, "generateInvoic", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EdiController.prototype, "getLogs", null);
exports.EdiController = EdiController = __decorate([
    (0, common_1.Controller)('edi'),
    __metadata("design:paramtypes", [edi_service_1.EdiService])
], EdiController);
//# sourceMappingURL=edi.controller.js.map