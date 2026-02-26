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
exports.TravelModule = void 0;
const common_1 = require("@nestjs/common");
const travel_service_1 = require("./travel.service");
const travel_controller_1 = require("./travel.controller");
const prisma_module_1 = require("../database/prisma.module");
const expenses_module_1 = require("../expenses/expenses.module");
let TravelModule = class TravelModule {
    service;
    constructor(service) {
        this.service = service;
    }
    async onModuleInit() {
        await this.service.seedRates();
    }
};
exports.TravelModule = TravelModule;
exports.TravelModule = TravelModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, expenses_module_1.ExpensesModule],
        controllers: [travel_controller_1.TravelController],
        providers: [travel_service_1.TravelService],
    }),
    __metadata("design:paramtypes", [travel_service_1.TravelService])
], TravelModule);
//# sourceMappingURL=travel.module.js.map