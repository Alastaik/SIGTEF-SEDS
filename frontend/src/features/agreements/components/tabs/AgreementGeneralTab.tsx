import { useState, useEffect } from 'react';
import type { Agreement } from '../../types';
import { agreementService } from '../../services/agreementService';
import { Save } from 'lucide-react';

interface AgreementGeneralTabProps {
  agreement: Agreement;
  onUpdate: () => void;
}

export function AgreementGeneralTab({ agreement, onUpdate }: AgreementGeneralTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    agreementNumber: agreement.agreementNumber,
    year: agreement.year,
    seiProcessNumber: agreement.seiProcessNumber || '',
    objectDescription: agreement.objectDescription || '',
    globalValue: agreement.globalValue || 0,
    notes: agreement.notes || ''
  });

  useEffect(() => {
    setFormData({
      agreementNumber: agreement.agreementNumber,
      year: agreement.year,
      seiProcessNumber: agreement.seiProcessNumber || '',
      objectDescription: agreement.objectDescription || '',
      globalValue: agreement.globalValue || 0,
      notes: agreement.notes || ''
    });
  }, [agreement]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'globalValue' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await agreementService.updateAgreement(agreement.id, {
        legalEntityId: agreement.legalEntityId,
        ...formData
      });
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar dados gerais.');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-slate-900">Dados Gerais</h2>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-sm px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
          >
            Editar Dados
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-500">Número do Termo</h3>
            <p className="mt-1 text-slate-900">{agreement.agreementNumber} / {agreement.year}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Processo SEI</h3>
            <p className="mt-1 text-slate-900">{agreement.seiProcessNumber || '-'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Valor Global Previsto</h3>
            <p className="mt-1 text-slate-900">
              {agreement.globalValue ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(agreement.globalValue) : '-'}
            </p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-slate-500">Objeto</h3>
            <p className="mt-1 text-slate-900 whitespace-pre-wrap">{agreement.objectDescription || '-'}</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-slate-500">Observações</h3>
            <p className="mt-1 text-slate-900 whitespace-pre-wrap">{agreement.notes || '-'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-slate-900 mb-6">Editar Dados Gerais</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-md text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Número do Termo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="agreementNumber"
              value={formData.agreementNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ano <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Processo SEI
            </label>
            <input
              type="text"
              name="seiProcessNumber"
              value={formData.seiProcessNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Valor Global Previsto (R$)
            </label>
            <input
              type="number"
              step="0.01"
              name="globalValue"
              value={formData.globalValue}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Objeto
          </label>
          <textarea
            name="objectDescription"
            value={formData.objectDescription}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Observações
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
