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
exports.MarketingController = void 0;
const common_1 = require("@nestjs/common");
const marketing_service_1 = require("./marketing.service");
let MarketingController = class MarketingController {
    marketingService;
    constructor(marketingService) {
        this.marketingService = marketingService;
    }
    createDiscount(body) {
        return this.marketingService.createDiscountCode(body);
    }
    getDiscounts(organizationId) {
        return this.marketingService.getDiscountCodes(organizationId);
    }
    validateDiscount(body) {
        return this.marketingService.validateDiscountCode(body.organizationId, body.code);
    }
};
exports.MarketingController = MarketingController;
__decorate([
    (0, common_1.Post)('discounts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MarketingController.prototype, "createDiscount", null);
__decorate([
    (0, common_1.Get)('discounts'),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketingController.prototype, "getDiscounts", null);
__decorate([
    (0, common_1.Post)('discounts/validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MarketingController.prototype, "validateDiscount", null);
exports.MarketingController = MarketingController = __decorate([
    (0, common_1.Controller)('marketing'),
    __metadata("design:paramtypes", [marketing_service_1.MarketingService])
], MarketingController);
//# sourceMappingURL=marketing.controller.js.map