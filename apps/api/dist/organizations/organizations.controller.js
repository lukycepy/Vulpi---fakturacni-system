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
exports.OrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const organizations_service_1 = require("./organizations.service");
const ares_service_1 = require("./ares.service");
const create_organization_dto_1 = require("./dto/create-organization.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let OrganizationsController = class OrganizationsController {
    organizationsService;
    aresService;
    constructor(organizationsService, aresService) {
        this.organizationsService = organizationsService;
        this.aresService = aresService;
    }
    async lookupAres(ico) {
        return this.aresService.lookup(ico);
    }
    async create(createOrganizationDto, req) {
        return this.organizationsService.create(createOrganizationDto, req.user.userId);
    }
    async findAll(req) {
        return this.organizationsService.findAll(req.user.userId, req.user.role);
    }
    async updateEmailConfig(id, config) {
        return this.organizationsService.updateEmailConfig(id, config);
    }
    async addBankAccount(id, config) {
        return this.organizationsService.addBankAccount(id, config);
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, common_1.Get)('ares/:ico'),
    __param(0, (0, common_1.Param)('ico')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "lookupAres", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_organization_dto_1.CreateOrganizationDto, Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(':id/email-config'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_organization_dto_1.UpdateEmailConfigDto]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "updateEmailConfig", null);
__decorate([
    (0, common_1.Post)(':id/bank-accounts'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_organization_dto_1.UpdateBankConfigDto]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "addBankAccount", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, common_1.Controller)('organizations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService,
        ares_service_1.AresService])
], OrganizationsController);
//# sourceMappingURL=organizations.controller.js.map