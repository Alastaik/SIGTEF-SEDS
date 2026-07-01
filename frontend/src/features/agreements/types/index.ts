export type AgreementStatus = 
  | 'DRAFT'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'EXPIRED'
  | 'CLOSED'
  | 'CANCELED'
  | 'UNDER_RENEWAL';

export type AttendanceFrequency = 'WEEKDAYS' | 'EVERY_DAY' | 'MANUAL';

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
  endDate?: string | null;
  hasEndDate?: boolean;
  globalValue?: number | null;
  annualValue?: number;
  status: 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'CANCELED' | 'FINISHED';
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
  attendanceFrequency?: AttendanceFrequency;
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
  attendanceFrequency?: AttendanceFrequency;
  attendanceDays?: number;
  perCapitaValue?: number;
  consumerUnitId?: string;
  active?: boolean;
}

export type AddendumStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPLIED' | 'CANCELED' | 'REJECTED';

export type AddendumType = 'PRAZO' | 'VALOR' | 'AMBOS' | 'OUTROS';

export interface AgreementAddendum {
  id: string;
  partnershipAgreementId: string;
  addendumNumber?: string;
  addendumType: AddendumType;
  status: AddendumStatus;
  signatureDate?: string;
  startDate?: string;
  newEndDate?: string;
  valueAddition?: number;
  justification?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AgreementAddendumRequest {
  partnershipAgreementId: string;
  addendumNumber?: string;
  addendumType: AddendumType;
  signatureDate?: string;
  startDate?: string;
  newEndDate?: string;
  valueAddition?: number;
  justification?: string;
  notes?: string;
}
