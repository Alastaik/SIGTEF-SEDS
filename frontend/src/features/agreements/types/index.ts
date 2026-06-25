export type AgreementStatus = 
  | 'DRAFT'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'EXPIRED'
  | 'CLOSED'
  | 'CANCELED'
  | 'UNDER_RENEWAL';

export interface Agreement {
  id: string;
  legalEntityId: string;
  legalEntityName?: string;
  agreementNumber: string;
  year: number;
  agreementTypeId?: string;
  agreementTypeName?: string;
  seiProcessNumber: string;
  processTypeId?: string;
  processTypeName?: string;
  objectDescription?: string;
  signatureDate?: string;
  startDate?: string;
  endDate?: string;
  globalValue?: number;
  status: AgreementStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AgreementRequest {
  legalEntityId: string;
  agreementNumber: string;
  year: number;
  agreementTypeId?: string;
  seiProcessNumber?: string;
  processTypeId?: string;
  objectDescription?: string;
  signatureDate?: string;
  startDate?: string;
  endDate?: string;
  globalValue?: number;
  notes?: string;
}

export interface AgreementProgram {
  id: string;
  partnershipAgreementId: string;
  programId: string;
  programName?: string;
  expectedMonthlyValue?: number;
  expectedTotalValue?: number;
  goalQuantity?: number;
  attendanceDays?: number;
  perCapitaValue?: number;
  consumerUnitId?: string;
  consumerUnitName?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AgreementProgramRequest {
  programId: string;
  expectedMonthlyValue?: number;
  expectedTotalValue?: number;
  goalQuantity?: number;
  attendanceDays?: number;
  perCapitaValue?: number;
  consumerUnitId?: string;
  active?: boolean;
}
