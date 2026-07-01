import { api } from '../../lib/api';

export interface MonthlyExecution {
  id: string;
  partnershipAgreementProgram: any; // We'll type this properly if needed
  competence: string;
  expectedValue: number;
  transferredValue?: number;
  transferDate?: string;
  expectedGoal?: number;
  expectedServiceDays?: number;
  consumerUnit?: any;
  status: 'WAITING_TRANSFER' | 'READY_FOR_ACCOUNTABILITY' | 'ACCOUNTABILITY_DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'PENDING_CORRECTION' | 'RESUBMITTED' | 'APPROVED' | 'REJECTED' | 'CLOSED' | 'BLOCKED' | 'CANCELED' | 'ACCOUNTABILITY_CLOSED_UNREALIZED';
  blocked: boolean;
  blockReason?: string;
  blockedBy?: any;
  blockedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MonthlyExecutionFilters {
  competence?: string;
  legalEntityId?: string;
  programId?: string;
  status?: string;
  page?: number;
  size?: number;
}

export const monthlyExecutionApi = {
  findAll: async (filters: MonthlyExecutionFilters) => {
    const params = new URLSearchParams();
    if (filters.competence) params.append('competence', filters.competence);
    if (filters.legalEntityId) params.append('legalEntityId', filters.legalEntityId);
    if (filters.programId) params.append('programId', filters.programId);
    if (filters.status) params.append('status', filters.status);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());

    const response = await api.get(`/monthly-executions?${params.toString()}`);
    return response.data;
  },

  generate: async (competence: string) => {
    const response = await api.post('/monthly-executions/generate', { competence });
    return response.data;
  },

  update: async (id: string, execution: Partial<MonthlyExecution>) => {
    const response = await api.put(`/monthly-executions/${id}`, execution);
    return response.data;
  },

  block: async (id: string, reason: string) => {
    const response = await api.post(`/monthly-executions/${id}/block`, { reason });
    return response.data;
  },

  unblock: async (id: string) => {
    const response = await api.post(`/monthly-executions/${id}/unblock`);
    return response.data;
  },

  registerTransfer: async (id: string, transferredValue: number, transferDate: string) => {
    const response = await api.post(`/monthly-executions/${id}/transfer`, { transferredValue, transferDate });
    return response.data;
  },

  registerBatchTransfer: async (executionIds: string[], transferDate: string) => {
    const response = await api.post(`/monthly-executions/transfer-batch`, { executionIds, transferDate });
    return response.data;
  }
};
