export class CreateDealDto {
  organizationId: string;
  title: string;
  value: number;
  clientId: string;
  stageId: string;
  expectedCloseDate?: string;
}

export class UpdateDealStageDto {
  stageId: string;
}
