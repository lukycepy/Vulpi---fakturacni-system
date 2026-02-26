"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let BackupService = BackupService_1 = class BackupService {
    logger = new common_1.Logger(BackupService_1.name);
    backupDir = path.join(process.cwd(), 'backups');
    encryptionKey = process.env.BACKUP_KEY || '12345678901234567890123456789012';
    constructor() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir);
        }
    }
    async handleDailyBackup() {
        this.logger.log('Starting daily backup...');
        const date = new Date().toISOString().split('T')[0];
        const filename = `backup-${date}.sql`;
        const filePath = path.join(this.backupDir, filename);
        const encryptedPath = `${filePath}.enc`;
        try {
            const dbUrl = process.env.DATABASE_URL;
            if (!dbUrl)
                throw new Error('DATABASE_URL not set');
            await execAsync(`pg_dump "${dbUrl}" > "${filePath}"`);
            this.logger.log(`Database dumped to ${filename}`);
            await this.encryptFile(filePath, encryptedPath);
            this.logger.log(`Backup encrypted to ${path.basename(encryptedPath)}`);
            await this.uploadToCloud(encryptedPath);
            fs.unlinkSync(filePath);
            this.logger.log('Backup process completed successfully.');
        }
        catch (error) {
            this.logger.error('Backup failed', error);
        }
    }
    async encryptFile(inputPath, outputPath) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
        const input = fs.createReadStream(inputPath);
        const output = fs.createWriteStream(outputPath);
        output.write(iv);
        return new Promise((resolve, reject) => {
            input.pipe(cipher).pipe(output)
                .on('finish', () => resolve())
                .on('error', reject);
        });
    }
    async uploadToCloud(filePath) {
        this.logger.log(`[MOCK] Uploading ${path.basename(filePath)} to AWS Glacier...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.logger.log('[MOCK] Upload complete.');
    }
};
exports.BackupService = BackupService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupService.prototype, "handleDailyBackup", null);
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BackupService);
//# sourceMappingURL=backup.service.js.map