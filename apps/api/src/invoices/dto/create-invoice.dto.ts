import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString, IsNumber, IsArray, ValidateNested, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;

  @IsNumber()
  @IsNotEmpty()
  vatRate: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;
}

export class CreateInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsDateString()
  @IsNotEmpty()
  issueDate: string;

  @IsDateString()
  @IsNotEmpty()
  taxableSupplyDate: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @IsString()
  @IsOptional()
  currency: string = 'CZK';

  @IsNumber()
  @IsOptional()
  exchangeRate?: number = 1;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
