import { api } from '../../../lib/api';
import type { LegalEntity, LegalEntityCreateDTO, LegalEntityUpdateStatusDTO } from '../types/entity';

export const entityService = {
  getAll: async () => {
    const response = await api.get<LegalEntity[]>('/admin/entities');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<LegalEntity>(`/admin/entities/${id}`);
    return response.data;
  },

  create: async (data: LegalEntityCreateDTO) => {
    const response = await api.post<LegalEntity>('/admin/entities', data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/entities/${id}`);
  },

  updateStatus: async (id: string, data: LegalEntityUpdateStatusDTO) => {
    const response = await api.put<LegalEntity>(
      `/admin/entities/${id}/status?status=${data.status}&reason=${encodeURIComponent(data.reason)}`
    );
    return response.data;
  },

  addAddress: async (id: string, data: any) => {
    const response = await api.post(`/admin/entities/${id}/addresses`, data);
    return response.data;
  },

  addContact: async (id: string, data: any) => {
    const response = await api.post(`/admin/entities/${id}/contacts`, data);
    return response.data;
  },

  addResponsible: async (id: string, data: any) => {
    const response = await api.post(`/admin/entities/${id}/responsibles`, data);
    return response.data;
  },

  addConsumerUnit: async (id: string, data: any) => {
    const response = await api.post(`/admin/entities/${id}/consumer-units`, data);
    return response.data;
  },

  updateConsumerUnit: async (id: string, unitId: string, data: any) => {
    const response = await api.put(`/admin/entities/${id}/consumer-units/${unitId}`, data);
    return response.data;
  },

  deleteConsumerUnit: async (id: string, unitId: string) => {
    const response = await api.delete(`/admin/entities/${id}/consumer-units/${unitId}`);
    return response.data;
  },

  addNote: async (id: string, data: any) => {
    const response = await api.post(`/admin/entities/${id}/notes`, data);
    return response.data;
  },

  searchCep: async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) throw new Error('CEP inválido');
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    if (data.erro) throw new Error('CEP não encontrado');
    return data;
  },

  // --- Módulo 05: Representantes ---
  
  getRepresentatives: async (entityId: string) => {
    const response = await api.get(`/admin/entities/${entityId}/representatives`);
    return response.data;
  },

  getPendingInvitations: async (entityId: string) => {
    const response = await api.get(`/admin/entities/${entityId}/representatives/invitations`);
    return response.data;
  },

  inviteRepresentative: async (entityId: string, data: any) => {
    const response = await api.post(`/admin/entities/${entityId}/representatives/invite`, data);
    return response.data;
  },

  revokeRepresentative: async (repId: string) => {
    const response = await api.put(`/admin/representatives/${repId}/revoke`);
    return response.data;
  },

  cancelInvitation: async (invId: string) => {
    const response = await api.put(`/admin/invitations/${invId}/cancel`);
    return response.data;
  },

  acceptInvitation: async (data: any) => {
    const response = await api.post(`/public/invitations/accept`, data);
    return response.data;
  }
};
