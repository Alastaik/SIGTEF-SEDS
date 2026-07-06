import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { energyApi } from '../../../energy/api';
import type { EnergyRecord } from '../../../energy/types';
import { 
  TariffFlagBadge, 
  EnergyStatsCards, 
  EnergyConsumptionChart, 
  EnergyRecordModal 
} from '../../../energy/components';
import { api } from '../../../../lib/api';

interface Props {
  entityId: string;
}

export function EntityEnergyTab({ entityId }: Props) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EnergyRecord | undefined>(undefined);

  // Fetch dashboard data
  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['energy-dashboard', entityId],
    queryFn: () => energyApi.getEntityDashboard(entityId)
  });

  // Fetch competences for dropdown
  const { data: competences = [] } = useQuery({
    queryKey: ['competences'],
    queryFn: async () => {
      const { data } = await api.get('/competences');
      return data.map((c: any) => ({ id: c.id, display: `${String(c.month).padStart(2, '0')}/${c.year}` }));
    }
  });

  // Fetch consumer units for dropdown
  const { data: consumerUnits = [] } = useQuery({
    queryKey: ['consumer-units', entityId],
    queryFn: async () => {
      const { data } = await api.get(`/legal-entities/${entityId}/consumer-units`);
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data: EnergyRecord) => energyApi.saveRecord(data),
    onSuccess: () => {
      toast.success('Lançamento salvo com sucesso');
      queryClient.invalidateQueries({ queryKey: ['energy-dashboard', entityId] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao salvar lançamento');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => energyApi.deleteRecord(id),
    onSuccess: () => {
      toast.success('Lançamento excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: ['energy-dashboard', entityId] });
    },
    onError: () => {
      toast.error('Erro ao excluir lançamento');
    }
  });

  const handleEdit = (record: EnergyRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingRecord(undefined);
    setIsModalOpen(true);
  };

  if (isDashboardLoading) {
    return <div className="p-8 text-center text-slate-500">Carregando dados de energia...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Auxílio Energia</h2>
          <p className="text-sm text-slate-500">Acompanhamento e lançamento de contas de energia</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Lançamento
        </button>
      </div>

      {dashboard && dashboard.records.length > 0 ? (
        <>
          <EnergyStatsCards dashboard={dashboard} />
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Histórico de Consumo</h3>
            <EnergyConsumptionChart dashboard={dashboard} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-base font-semibold text-slate-800">Lançamentos Recentes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-medium">Competência</th>
                    <th className="px-6 py-3 font-medium">Unidade Consumidora</th>
                    <th className="px-6 py-3 font-medium">Consumo</th>
                    <th className="px-6 py-3 font-medium">Valor Total</th>
                    <th className="px-6 py-3 font-medium">Custo Unitário</th>
                    <th className="px-6 py-3 font-medium">Bandeira</th>
                    <th className="px-6 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dashboard.records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{record.competenceDisplay}</td>
                      <td className="px-6 py-4 text-slate-600">{record.consumerUnitNumber || 'Consolidado'}</td>
                      <td className="px-6 py-4 text-slate-600">{record.kwhAmount.toLocaleString('pt-BR')} kWh</td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(record.totalValue)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(record.kwhUnitCost || 0)}/kWh
                      </td>
                      <td className="px-6 py-4">
                        <TariffFlagBadge flag={record.tariffFlag} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
                              deleteMutation.mutate(record.id!);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum lançamento</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Não há registros de energia para esta entidade. Clique em "Novo Lançamento" para começar.
          </p>
        </div>
      )}

      {isModalOpen && (
        <EnergyRecordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => saveMutation.mutate(data)}
          initialData={editingRecord}
          entityId={entityId}
          competences={competences}
          consumerUnits={consumerUnits}
        />
      )}
    </div>
  );
}
