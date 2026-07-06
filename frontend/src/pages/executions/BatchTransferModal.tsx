import { useState } from 'react';
import { X, DollarSign, AlertCircle } from 'lucide-react';
import { monthlyExecutionApi } from '../../features/executions/api';

interface BatchTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  executionIds: string[];
  onSuccess: () => void;
}

export function BatchTransferModal({ isOpen, onClose, executionIds, onSuccess }: BatchTransferModalProps) {
  const [loading, setLoading] = useState(false);
  const [transferDate, setTransferDate] = useState('');

  if (!isOpen) return null;

  const handleRegisterBatchTransfer = async () => {
    if (!transferDate) {
      alert('Por favor, preencha a data do repasse.');
      return;
    }
    setLoading(true);
    try {
      await monthlyExecutionApi.registerBatchTransfer(executionIds, transferDate);
      onSuccess();
    } catch (e) {
      alert('Erro ao registrar repasse em lote.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="text-emerald-600" size={20} />
            Repasse em Lote
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex gap-3 text-sm">
            <AlertCircle className="shrink-0 text-emerald-600" size={20} />
            <p>
              Você está prestes a registrar o repasse para <strong>{executionIds.length}</strong> lançamentos simultaneamente.
              <br/><br/>
              <strong>Nota:</strong> O valor repassado será considerado <strong>exatamente igual ao valor previsto</strong> de cada entidade.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data do Repasse
            </label>
            <input 
              type="date" 
              required
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleRegisterBatchTransfer}
            disabled={loading || !transferDate}
            className="bg-emerald-600 border border-transparent text-white hover:bg-emerald-700 px-4 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Confirmar Repasses'}
          </button>
        </div>
      </div>
    </div>
  );
}
