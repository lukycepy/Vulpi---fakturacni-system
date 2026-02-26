import { Controller, Get, Post, Body, Query, UseInterceptors, UploadedFile, ParseFilePipeBuilder } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import { CashflowService } from './cashflow.service';

@Controller('expenses')
export class ExpensesController {
  constructor(
      private readonly expensesService: ExpensesService,
      private readonly ocrService: OcrService,
      private readonly cashflowService: CashflowService
  ) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  findAll(@Query('organizationId') organizationId: string) {
    return this.expensesService.findAll(organizationId);
  }

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyze(
      @UploadedFile(
        new ParseFilePipeBuilder()
        .build({
            fileIsRequired: true,
        }),
      ) file: Express.Multer.File
  ) {
      return this.ocrService.analyzeFile(file.buffer);
  }

  @Get('cashflow')
  async getCashflow(@Query('organizationId') organizationId: string) {
      return this.cashflowService.getPrediction(organizationId);
  }
}
