export type TariffFlag = 'VERDE' | 'AMARELA' | 'VERMELHA_PATAMAR_1' | 'VERMELHA_PATAMAR_2' | 'ESCASSEZ_HIDRICA';

export interface EnergyRecord {
  id?: string;
  legalEntityId: string;
  legalEntityName?: string;
  consumerUnitId?: string | null;
  consumerUnitNumber?: string;
  competenceId: string;
  competenceMonth?: number;
  competenceYear?: number;
  competenceDisplay?: string;
  kwhAmount: number;
  tariffFlag: TariffFlag;
  totalValue: number;
  kwhUnitCost?: number;
  notes?: string;
}

export interface EnergyDashboard {
  legalEntityId: string;
  legalEntityName: string;
  records: EnergyRecord[];
  avgValue: number;
  avgKwh: number;
  avgUnitCost: number;
  stdDevValue: number;
  maxValue: number;
  minValue: number;
  momChangePercentage: number;
  totalPeriod: number;
  flagDistribution: Record<string, number>;
}

export interface EnergyGlobalEntitySummary {
  legalEntityId: string;
  legalEntityName: string;
  totalKwh: number;
  totalValue: number;
  monthsRecorded: number;
  mostFrequentFlag: string;
}

export interface GlobalEnergyDashboard {
  year: number;
  totalSpentYear: number;
  totalEntities: number;
  totalRecords: number;
  monthlyTotal: Record<string, number>;
  flagDistribution: Record<string, number>;
  entitySummaries: EnergyGlobalEntitySummary[];
}
