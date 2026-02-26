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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmailConfigDto = exports.UpdateBankConfigDto = exports.CreateOrganizationDto = void 0;
const class_validator_1 = require("class-validator");
class CreateOrganizationDto {
    ico;
    dic;
    name;
    address;
}
exports.CreateOrganizationDto = CreateOrganizationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "ico", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "dic", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "address", void 0);
class UpdateBankConfigDto {
    integrationType;
}
exports.UpdateBankConfigDto = UpdateBankConfigDto;
__decorate([
    (0, class_validator_1.IsEnum)(['API_FIO', 'EMAIL_PARSING_AIRBANK', 'EMAIL_PARSING_KB']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateBankConfigDto.prototype, "integrationType", void 0);
class UpdateEmailConfigDto {
    host;
    port;
    user;
    password;
}
exports.UpdateEmailConfigDto = UpdateEmailConfigDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateEmailConfigDto.prototype, "host", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateEmailConfigDto.prototype, "port", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateEmailConfigDto.prototype, "user", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateEmailConfigDto.prototype, "password", void 0);
//# sourceMappingURL=create-organization.dto.js.map