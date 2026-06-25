import { api } from '../lib/api';

export interface Program {
  id: string;
  name: string;
  type: string;
  code?: string;
  description?: string;
  requiresGoal: boolean;
  requiresServiceDays: boolean;
  requiresConsumerUnit: boolean;
  requiresInvoice: boolean;
  requiresReceipt: boolean;
  active: boolean;
  calculationType?: string;
}

export const programService = {
  getAll: async (): Promise<Program[]> => {
    const response = await api.get('/programs');
    return response.data;
  },
  getById: async (id: string): Promise<Program> => {
    const response = await api.get(`/programs/${id}`);
    return response.data;
  },
  create: async (program: Partial<Program>): Promise<Program> => {
    const response = await api.post('/programs', program);
    return response.data;
  },
  update: async (id: string, program: Partial<Program>): Promise<Program> => {
    const response = await api.put(`/programs/${id}`, program);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/programs/${id}`);
  }
};
