import { api } from '../../../lib/api';
import type { Agreement, AgreementRequest, AgreementProgram, AgreementProgramRequest, AgreementStatus } from '../types';

export const agreementService = {
  createAgreement: async (data: AgreementRequest): Promise<Agreement> => {
    const response = await api.post('/admin/agreements', data);
    return response.data;
  },

  getAllAgreements: async (legalEntityId?: string): Promise<Agreement[]> => {
    const params = legalEntityId ? { legalEntityId } : {};
    const response = await api.get('/admin/agreements', { params });
    return response.data;
  },

  getAgreementById: async (id: string): Promise<Agreement> => {
    const response = await api.get(`/admin/agreements/${id}`);
    return response.data;
  },

  updateAgreement: async (id: string, data: AgreementRequest): Promise<Agreement> => {
    const response = await api.put(`/admin/agreements/${id}`, data);
    return response.data;
  },

  deleteAgreement: async (id: string): Promise<void> => {
    await api.delete(`/admin/agreements/${id}`);
  },

  changeStatus: async (id: string, status: AgreementStatus): Promise<void> => {
    await api.patch(`/admin/agreements/${id}/status`, null, {
      params: { status }
    });
  },

  addProgram: async (id: string, data: AgreementProgramRequest): Promise<AgreementProgram> => {
    const response = await api.post(`/admin/agreements/${id}/programs`, data);
    return response.data;
  },

  getPrograms: async (id: string): Promise<AgreementProgram[]> => {
    const response = await api.get(`/admin/agreements/${id}/programs`);
    return response.data;
  },

  removeProgram: async (programId: string): Promise<void> => {
    // Note: O backend tem esse endpoint com /{id}/programs/{programId}. No codigo estava assim, mas eu alterei no backend. Vou arrumar.
    await api.delete(`/admin/agreements/programs/${programId}`);
  },

  simulateExpectedValue: async (agreementId: string, programId: string, month: number, year: number) => {
    // Note: No backend o caminho de PartnershipAgreementController está configurado como @RequestMapping("/api/admin/agreements")
    const response = await api.get(`/admin/agreements/${agreementId}/programs/${programId}/simulate`, {
      params: { month, year }
    });
    return response.data;
  },

  listAddendums: async (agreementId: string): Promise<any[]> => {
    const response = await api.get(`/agreements/${agreementId}/addendums`);
    return response.data;
  },

  createAddendum: async (data: any): Promise<any> => {
    const response = await api.post('/agreements/addendums', data);
    return response.data;
  },

  changeAddendumStatus: async (id: string, status: string): Promise<any> => {
    const response = await api.patch(`/agreements/addendums/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  deleteAddendum: async (id: string): Promise<void> => {
    await api.delete(`/agreements/addendums/${id}`);
  }
};
