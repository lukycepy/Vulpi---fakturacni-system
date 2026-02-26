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
exports.SystemHealthController = void 0;
const common_1 = require("@nestjs/common");
const system_health_service_1 = require("./system-health.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const database_1 = require("@vulpi/database");
let SystemHealthController = class SystemHealthController {
    healthService;
    constructor(healthService) {
        this.healthService = healthService;
    }
    getHealth() {
        return this.healthService.getHealthStatus();
    }
    async restartJob(jobName) {
        return { message: `Job ${jobName} restart signal sent.` };
    }
};
exports.SystemHealthController = SystemHealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemHealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Post)('restart-job'),
    __param(0, (0, common_1.Body)('jobName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemHealthController.prototype, "restartJob", null);
exports.SystemHealthController = SystemHealthController = __decorate([
    (0, common_1.Controller)('admin/system-health'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(database_1.Role.SUPERADMIN),
    __metadata("design:paramtypes", [system_health_service_1.SystemHealthService])
], SystemHealthController);
//# sourceMappingURL=system-health.controller.js.map