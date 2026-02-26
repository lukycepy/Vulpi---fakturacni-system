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
exports.GdprController = void 0;
const common_1 = require("@nestjs/common");
const gdpr_service_1 = require("./gdpr.service");
let GdprController = class GdprController {
    gdprService;
    constructor(gdprService) {
        this.gdprService = gdprService;
    }
    async anonymize(body) {
        return this.gdprService.anonymizeClient(body.clientId, body.organizationId);
    }
    async exportUser(userId, res) {
        const data = await this.gdprService.exportUserData(userId);
        res.set({
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename=user-data.json'
        });
        res.send(JSON.stringify(data, null, 2));
    }
};
exports.GdprController = GdprController;
__decorate([
    (0, common_1.Post)('anonymize-client'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GdprController.prototype, "anonymize", null);
__decorate([
    (0, common_1.Get)('export-user'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GdprController.prototype, "exportUser", null);
exports.GdprController = GdprController = __decorate([
    (0, common_1.Controller)('gdpr'),
    __metadata("design:paramtypes", [gdpr_service_1.GdprService])
], GdprController);
//# sourceMappingURL=gdpr.controller.js.map