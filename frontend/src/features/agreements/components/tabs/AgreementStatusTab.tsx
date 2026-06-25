import { useState } from 'react';
import type { Agreement, AgreementStatus } from '../../types';
import { agreementService } from '../../services/agreementService';
import { Activity, AlertCircle, Save } from 'lucide-react';

interface AgreementStatusTabProps {
  agreement: Agreement;
  onUpdate: () => void;
}

export function AgreementStatusTab({ agreement, onUpdate }: AgreementStatusTabProps) {
  const [status, setStatus] = useState<AgreementStatus>(agreement.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === agreement.status) return;

    if (!confirm(`Tem certeza que deseja alterar o status do termo para ${getStatusLabel(status)}?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await agreementService.changeStatus(agreement.id, status);
      onUpdate();
    } catch (err: any) {
      setError('Erro ao alterar status: ' + (err.message || 'Erro desconhecido.'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (s: AgreementStatus) => {
    switch (s) {
      case 'DRAFT': return 'Rascunho';
      case 'ACTIVE': return 'Ativo';
      case 'SUSPENDED': return 'Suspenso';
      case 'EXPIRED': return 'Vencido';
      case 'CLOSED': return 'Encerrado';
      case 'CANCELED': return 'Cancelado';
      case 'UNDER_RENEWAL': return 'Em Renovação';
      default: return s;
    }
  };

  const statusOptions: AgreementStatus[] = [
    'DRAFT', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'CLOSED', 'CANCELED', 'UNDER_RENEWAL'
  ] as const;

  return (
    <div>
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Evolução de Status</h2>
          <p className="text-sm text-slate-500">Gestão do ciclo de vida deste termo de fomento.</p>
        </div>
      </div>

      <div className="p-6 max-w-2xl">
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md text-sm border border-red-100 flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5" />
            <div>
              <p className="font-medium">Erro ao atualizar</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-blue-600" size={24} />
            <h3 className="text-lg font-medium text-slate-900">Status Atual: <span className="font-bold">{getStatusLabel(agreement.status)}</span></h3>
          </div>

          <p className="text-slate-600 text-sm mb-6">
            O status atual reflete a situação legal e operacional do termo de fomento perante a secretaria.
            Alterações de status podem afetar pagamentos e acessos da entidade no portal.
          </p>

          <form onSubmit={handleStatusChange} className="space-y-4 border-t border-slate-100 pt-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Alterar para novo status:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AgreementStatus)}
                className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{getStatusLabel(opt)}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || status === agreement.status}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {loading ? 'Salvando...' : 'Atualizar Status'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
