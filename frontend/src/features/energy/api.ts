import { api } from '../../lib/api';
import type { EnergyRecord, EnergyDashboard, GlobalEnergyDashboard } from './types';

export const energyApi = {
  getRecordsByEntity: async (entityId: string): Promise<EnergyRecord[]> => {
    const response = await api.get(`/energy/records?entityId=${entityId}`);
    return response.data;
  },

  saveRecord: async (record: EnergyRecord): Promise<EnergyRecord> => {
    const response = await api.post('/energy/records', record);
    return response.data;
  },

  deleteRecord: async (id: string): Promise<void> => {
    await api.delete(`/energy/records/${id}`);
  },

  getEntityDashboard: async (entityId: string, months = 12): Promise<EnergyDashboard> => {
    const response = await api.get(`/energy/dashboard/${entityId}?months=${months}`);
    return response.data;
  },

  getGlobalDashboard: async (year: number): Promise<GlobalEnergyDashboard> => {
    const response = await api.get(`/energy/dashboard/global?year=${year}`);
    return response.data;
  }
};
