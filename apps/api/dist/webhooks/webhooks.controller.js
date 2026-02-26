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
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const webhooks_service_1 = require("./webhooks.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let WebhooksController = class WebhooksController {
    webhooksService;
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
    }
    create(body) {
        return this.webhooksService.createEndpoint(body.organizationId, body.url, body.events);
    }
    list(organizationId) {
        return this.webhooksService.listEndpoints(organizationId);
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "list", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, common_1.Controller)('webhooks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map