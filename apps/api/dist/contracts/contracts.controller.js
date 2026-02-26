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
exports.ContractsController = void 0;
const common_1 = require("@nestjs/common");
const contracts_service_1 = require("./contracts.service");
let ContractsController = class ContractsController {
    contractsService;
    constructor(contractsService) {
        this.contractsService = contractsService;
    }
    createTemplate(body) {
        return this.contractsService.createTemplate(body);
    }
    getTemplates(organizationId) {
        return this.contractsService.getTemplates(organizationId);
    }
    generateContract(body) {
        return this.contractsService.generateContract(body);
    }
    getContracts(organizationId) {
        return this.contractsService.getContracts(organizationId);
    }
    getPublicContract(token) {
        return this.contractsService.getContractByToken(token);
    }
    signContract(token, body) {
        return this.contractsService.signContract(token, body);
    }
};
exports.ContractsController = ContractsController;
__decorate([
    (0, common_1.Post)('templates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "generateContract", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "getContracts", null);
__decorate([
    (0, common_1.Get)('public/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "getPublicContract", null);
__decorate([
    (0, common_1.Post)('public/:token/sign'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "signContract", null);
exports.ContractsController = ContractsController = __decorate([
    (0, common_1.Controller)('contracts'),
    __metadata("design:paramtypes", [contracts_service_1.ContractsService])
], ContractsController);
//# sourceMappingURL=contracts.controller.js.map