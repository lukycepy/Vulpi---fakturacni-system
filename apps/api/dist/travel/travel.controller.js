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
exports.TravelController = void 0;
const common_1 = require("@nestjs/common");
const travel_service_1 = require("./travel.service");
let TravelController = class TravelController {
    travelService;
    constructor(travelService) {
        this.travelService = travelService;
    }
    create(body) {
        return this.travelService.create(body);
    }
    findAll(organizationId, userId) {
        return this.travelService.findAll(organizationId, userId);
    }
    approve(id, approverId) {
        return this.travelService.approve(id, approverId);
    }
    reject(id, approverId) {
        return this.travelService.reject(id, approverId);
    }
};
exports.TravelController = TravelController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TravelController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('organizationId')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TravelController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('approverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TravelController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('approverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TravelController.prototype, "reject", null);
exports.TravelController = TravelController = __decorate([
    (0, common_1.Controller)('travel'),
    __metadata("design:paramtypes", [travel_service_1.TravelService])
], TravelController);
//# sourceMappingURL=travel.controller.js.map