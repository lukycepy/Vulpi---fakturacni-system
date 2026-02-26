import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('hr')
@UseGuards(JwtAuthGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('employees')
  getEmployees(@Query('organizationId') organizationId: string) {
    return this.hrService.getEmployees(organizationId);
  }

  @Patch('employees/:id')
  updateEmployee(@Param('id') id: string, @Body() body: any) {
    return this.hrService.updateEmployee(id, body);
  }

  @Get('payroll')
  getPayroll(
      @Query('organizationId') organizationId: string,
      @Query('month') month: string,
      @Query('year') year: string
  ) {
      return this.hrService.calculatePayroll(organizationId, Number(month), Number(year));
  }

  @Post('reimbursements')
  createReimbursement(@Body() body: any) {
      return this.hrService.createReimbursement(body.organizationId, body.userId, body);
  }

  @Get('reimbursements')
  getReimbursements(@Query('organizationId') organizationId: string, @Query('userId') userId?: string) {
      return this.hrService.getReimbursements(organizationId, userId);
  }
}
