import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { EnergyRecord, TariffFlag } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EnergyRecord) => void;
  initialData?: EnergyRecord;
  entityId: string;
  consumerUnits: { id: string; unitNumber: string }[];
  competences: { id: string; display: string }[];
}

export function EnergyRecordModal({ isOpen, onClose, onSave, initialData, entityId, consumerUnits, competences }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EnergyRecord>({
    defaultValues: initialData || {
      legalEntityId: entityId,
      kwhAmount: 0,
      totalValue: 0,
      tariffFlag: 'VERDE'
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      reset(initialData || {
        legalEntityId: entityId,
        kwhAmount: 0,
        totalValue: 0,
        tariffFlag: 'VERDE'
      });
    }
  }, [isOpen, initialData, entityId, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: EnergyRecord) => {
    onSave({
      ...data,
      legalEntityId: entityId,
      kwhAmount: Number(data.kwhAmount),
      totalValue: Number(data.totalValue),
      consumerUnitId: data.consumerUnitId || null
    });
  };

  return (
    <div className="fixed inset-0 bg-emerald-950/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {initialData ? 'Editar Lançamento' : 'Novo Lançamento de Energia'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Competência *
              </label>
              <select
                {...register('competenceId', { required: 'Obrigatório' })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                {competences.map(c => (
                  <option key={c.id} value={c.id}>{c.display}</option>
                ))}
              </select>
              {errors.competenceId && <p className="mt-1 text-sm text-red-600">{errors.competenceId.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Unidade Consumidora
              </label>
              <select
                {...register('consumerUnitId')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Consolidado da Entidade</option>
                {consumerUnits.map(cu => (
                  <option key={cu.id} value={cu.id}>{cu.unitNumber}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Consumo (kWh) *
              </label>
              <input
                type="number"
                step="0.001"
                {...register('kwhAmount', { required: 'Obrigatório', min: 0 })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errors.kwhAmount && <p className="mt-1 text-sm text-red-600">{errors.kwhAmount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valor Total (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('totalValue', { required: 'Obrigatório', min: 0 })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errors.totalValue && <p className="mt-1 text-sm text-red-600">{errors.totalValue.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bandeira Tarifária *
            </label>
            <select
              {...register('tariffFlag', { required: 'Obrigatório' })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="VERDE">Verde</option>
              <option value="AMARELA">Amarela</option>
              <option value="VERMELHA_PATAMAR_1">Vermelha Patamar 1</option>
              <option value="VERMELHA_PATAMAR_2">Vermelha Patamar 2</option>
              <option value="ESCASSEZ_HIDRICA">Escassez Hídrica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Observações
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
