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
var DbMaintenanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemHealthModule = exports.DbMaintenanceService = void 0;
const common_1 = require("@nestjs/common");
const system_health_service_1 = require("./system-health.service");
const system_health_controller_1 = require("./system-health.controller");
const prisma_module_1 = require("../database/prisma.module");
const communication_module_1 = require("../communication/communication.module");
const schedule_1 = require("@nestjs/schedule");
const schedule_2 = require("@nestjs/schedule");
const common_2 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let DbMaintenanceService = DbMaintenanceService_1 = class DbMaintenanceService {
    prisma;
    health;
    logger = new common_2.Logger(DbMaintenanceService_1.name);
    constructor(prisma, health) {
        this.prisma = prisma;
        this.health = health;
    }
    async runMaintenance() {
        const start = Date.now();
        try {
            this.logger.log('Running DB Maintenance...');
            const date = new Date();
            date.setDate(date.getDate() - 30);
            const deleted = await this.prisma.jobLog.deleteMany({
                where: { executedAt: { lt: date } }
            });
            this.logger.log(`Cleaned ${deleted.count} old logs.`);
            await this.health.logJobExecution('DbMaintenance', 'SUCCESS', Date.now() - start);
        }
        catch (e) {
            await this.health.logJobExecution('DbMaintenance', 'FAIL', Date.now() - start, e.message);
        }
    }
};
exports.DbMaintenanceService = DbMaintenanceService;
__decorate([
    (0, schedule_2.Cron)(schedule_2.CronExpression.EVERY_WEEK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DbMaintenanceService.prototype, "runMaintenance", null);
exports.DbMaintenanceService = DbMaintenanceService = DbMaintenanceService_1 = __decorate([
    (0, common_2.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        system_health_service_1.SystemHealthService])
], DbMaintenanceService);
let SystemHealthModule = class SystemHealthModule {
};
exports.SystemHealthModule = SystemHealthModule;
exports.SystemHealthModule = SystemHealthModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, communication_module_1.CommunicationModule, schedule_1.ScheduleModule],
        controllers: [system_health_controller_1.SystemHealthController],
        providers: [system_health_service_1.SystemHealthService, DbMaintenanceService],
        exports: [system_health_service_1.SystemHealthService],
    })
], SystemHealthModule);
//# sourceMappingURL=system-health.module.js.map