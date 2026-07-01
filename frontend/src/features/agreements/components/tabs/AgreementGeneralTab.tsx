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
    notes: agreement.notes || '',
    signatureDate: agreement.signatureDate || '',
    startDate: agreement.startDate || '',
    endDate: agreement.endDate || ''
  });

  useEffect(() => {
    setFormData({
      agreementNumber: agreement.agreementNumber,
      year: agreement.year,
      seiProcessNumber: agreement.seiProcessNumber || '',
      objectDescription: agreement.objectDescription || '',
      globalValue: agreement.globalValue || 0,
      notes: agreement.notes || '',
      signatureDate: agreement.signatureDate || '',
      startDate: agreement.startDate || '',
      endDate: agreement.endDate || ''
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
        ...formData,
        signatureDate: formData.signatureDate || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
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
            <h3 className="text-sm font-medium text-slate-500 flex items-center gap-1">
              Valores Calculados (R$)
              <div className="w-3 h-3 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]" title="Calculado automaticamente com base nos programas">?</div>
            </h3>
            <div className="mt-1 flex flex-col gap-1">
              <p className="text-slate-900 text-sm">
                <span className="text-slate-500 mr-2">Global:</span> 
                {agreement.hasEndDate === false ? (
                  <span className="text-orange-500 text-xs bg-orange-50 px-1 py-0.5 rounded">Termo sem data de fim</span>
                ) : (
                  agreement.globalValue ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(agreement.globalValue) : '-'
                )}
              </p>
              <p className="text-slate-900 text-sm">
                <span className="text-slate-500 mr-2">Anual:</span>
                {agreement.annualValue ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(agreement.annualValue) : '-'}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Datas</h3>
            <div className="mt-1 flex flex-col gap-1 text-sm text-slate-900">
              <p><span className="text-slate-500 mr-2">Assinatura:</span> {agreement.signatureDate ? new Date(agreement.signatureDate).toLocaleDateString('pt-BR') : '-'}</p>
              <p><span className="text-slate-500 mr-2">Início:</span> {agreement.startDate ? new Date(agreement.startDate).toLocaleDateString('pt-BR') : '-'}</p>
              <p><span className="text-slate-500 mr-2">Fim:</span> {agreement.endDate ? new Date(agreement.endDate).toLocaleDateString('pt-BR') : '-'}</p>
            </div>
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
            <label className="flex items-center text-sm font-medium text-slate-700 mb-1 group relative">
              Valores Calculados (R$)
              <div className="ml-2 w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs cursor-help">
                ?
              </div>
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10">
                Os valores são calculados automaticamente com base nos programas vinculados (suas metas e meses de vigência) e nos últimos lançamentos (para água e energia).
              </div>
            </label>
            <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-md border border-slate-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Valor Anual (12 meses):</span>
                <span className="font-semibold text-slate-700">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(agreement.annualValue || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-2">
                <span className="text-slate-500">Valor Global Previsto:</span>
                {agreement.hasEndDate === false ? (
                  <span className="text-orange-500 font-medium text-xs bg-orange-50 px-2 py-1 rounded">Termo sem data de fim</span>
                ) : (
                  <span className="font-semibold text-blue-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(agreement.globalValue || 0)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data de Assinatura
            </label>
            <input
              type="date"
              name="signatureDate"
              value={formData.signatureDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data de Início
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data de Fim (Opcional)
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
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
