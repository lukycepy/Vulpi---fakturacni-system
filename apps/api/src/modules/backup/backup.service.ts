import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');
  private readonly encryptionKey = process.env.BACKUP_KEY || '12345678901234567890123456789012'; // 32 bytes

  constructor() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyBackup() {
    this.logger.log('Starting daily backup...');

    const date = new Date().toISOString().split('T')[0];
    const filename = `backup-${date}.sql`;
    const filePath = path.join(this.backupDir, filename);
    const encryptedPath = `${filePath}.enc`;

    try {
      // 1. Dump Database (PostgreSQL)
      // Assuming DATABASE_URL is available and pg_dump is in PATH
      // For demo purposes, we might skip actual pg_dump if not available, but here is the code.
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) throw new Error('DATABASE_URL not set');

      // Simple pg_dump command
      await execAsync(`pg_dump "${dbUrl}" > "${filePath}"`);
      this.logger.log(`Database dumped to ${filename}`);

      // 2. Encrypt
      await this.encryptFile(filePath, encryptedPath);
      this.logger.log(`Backup encrypted to ${path.basename(encryptedPath)}`);

      // 3. Upload to External Storage (Mock)
      await this.uploadToCloud(encryptedPath);

      // 4. Cleanup
      fs.unlinkSync(filePath); // Delete unencrypted
      // fs.unlinkSync(encryptedPath); // Keep encrypted locally or delete after upload?

      this.logger.log('Backup process completed successfully.');
    } catch (error) {
      this.logger.error('Backup failed', error);
    }
  }

  private async encryptFile(inputPath: string, outputPath: string) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
    
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    output.write(iv); // Prepend IV

    return new Promise<void>((resolve, reject) => {
      input.pipe(cipher).pipe(output)
        .on('finish', () => resolve())
        .on('error', reject);
    });
  }

  private async uploadToCloud(filePath: string) {
    // Mock AWS S3 / Google Drive Upload
    // const s3 = new S3(...);
    // await s3.upload(...);
    this.logger.log(`[MOCK] Uploading ${path.basename(filePath)} to AWS Glacier...`);
    await new Promise<void>(resolve => setTimeout(resolve, 1000));
    this.logger.log('[MOCK] Upload complete.');
  }
}
