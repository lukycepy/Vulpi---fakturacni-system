"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdiModule = void 0;
const common_1 = require("@nestjs/common");
const edi_service_1 = require("./edi.service");
const edi_controller_1 = require("./edi.controller");
const prisma_module_1 = require("../database/prisma.module");
let EdiModule = class EdiModule {
};
exports.EdiModule = EdiModule;
exports.EdiModule = EdiModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [edi_controller_1.EdiController],
        providers: [edi_service_1.EdiService],
    })
], EdiModule);
//# sourceMappingURL=edi.module.js.map