import { useState } from 'react';
import { api } from '../../lib/api';
import { X, Lock, Unlock, Save, DollarSign, FileText } from 'lucide-react';
import type { MonthlyExecution } from '../../features/executions/api';
import { monthlyExecutionApi } from '../../features/executions/api';
import { formatCurrency } from '../../utils/formatters';
import { RequirePermission } from '../../features/auth/RequirePermission';
import { AccountabilityModal } from './AccountabilityModal';
import { ExecutionStatusBadge } from '../../features/executions/components/ExecutionStatusBadge';

interface MonthlyExecutionDetailsModalProps {
  execution: MonthlyExecution;
  onClose: () => void;
  onUpdate: () => void;
}

export function MonthlyExecutionDetailsModal({ execution, onClose, onUpdate }: MonthlyExecutionDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [expectedValue, setExpectedValue] = useState((execution.expectedValue || 0).toString());
  const [blockReason, setBlockReason] = useState('');
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferredValue, setTransferredValue] = useState((execution.transferredValue || '').toString());
  const [transferDate, setTransferDate] = useState(execution.transferDate || '');
  const [loading, setLoading] = useState(false);
  const [showAccountabilityModal, setShowAccountabilityModal] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await monthlyExecutionApi.update(execution.id, {
        expectedValue: parseFloat(expectedValue)
      });
      setIsEditing(false);
      onUpdate();
    } catch (e) {
      alert('Erro ao atualizar lançamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async () => {
    if (execution.blocked) {
      if (!confirm('Deseja realmente desbloquear este lançamento?')) return;
      setLoading(true);
      try {
        await monthlyExecutionApi.unblock(execution.id);
        setShowBlockConfirm(false);
        onUpdate();
      } catch (e) {
        alert('Erro ao desbloquear.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!blockReason.trim()) {
        alert('Por favor, informe o motivo do bloqueio.');
        return;
      }
      setLoading(true);
      try {
        await monthlyExecutionApi.block(execution.id, blockReason);
        setShowBlockConfirm(false);
        onUpdate();
      } catch (e) {
        alert('Erro ao bloquear.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRegisterTransfer = async () => {
    if (!transferredValue || !transferDate) {
      alert('Por favor, preencha o valor e a data do repasse.');
      return;
    }
    setLoading(true);
    try {
      await monthlyExecutionApi.registerTransfer(
        execution.id, 
        parseFloat(transferredValue), 
        transferDate
      );
      setIsTransferring(false);
      onUpdate();
    } catch (e) {
      alert('Erro ao registrar repasse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Detalhes do Lançamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-gray-500 font-medium">Competência</span>
              <span className="font-semibold text-gray-900">{execution.competence}</span>
            </div>
            <div>
              <span className="block text-gray-500 font-medium">Status</span>
              <div className="flex items-center gap-2 mt-1">
                <ExecutionStatusBadge status={execution.status} />
                {execution.blocked && <span className="font-semibold text-red-600">(BLOQUEADO)</span>}
              </div>
            </div>
            <div className="col-span-2">
              <span className="block text-gray-500 font-medium">Entidade</span>
              <span className="font-semibold text-gray-900">{execution.partnershipAgreementProgram?.partnershipAgreement?.legalEntity?.tradeName}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-gray-500 font-medium">Programa</span>
              <span className="font-semibold text-gray-900">{execution.partnershipAgreementProgram?.program?.name}</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Valores e Metas</h3>
              {!isEditing && (
                <RequirePermission permission="ROLE_GESTOR">
                  <button onClick={() => setIsEditing(true)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    Ajustar Valor Manualmente
                  </button>
                </RequirePermission>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-medium">Valor Previsto (R$)</label>
                {isEditing ? (
                  <input 
                    type="number" 
                    value={expectedValue}
                    onChange={(e) => setExpectedValue(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                ) : (
                  <span className="text-lg font-mono text-gray-900">{formatCurrency(execution.expectedValue)}</span>
                )}
              </div>
              {execution.expectedGoal && (
                <div>
                  <label className="block text-xs text-gray-500 font-medium">Meta de Atendimentos</label>
                  <span className="text-gray-900">{execution.expectedGoal}</span>
                </div>
              )}
              {execution.expectedServiceDays && (
                <div>
                  <label className="block text-xs text-gray-500 font-medium">Dias de Serviço</label>
                  <span className="text-gray-900">{execution.expectedServiceDays}</span>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-100">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={loading} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 flex items-center gap-2">
                  <Save size={16}/> Salvar
                </button>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Dados do Repasse Real</h3>
              {!isTransferring && execution.status !== 'APPROVED' && execution.status !== 'CLOSED' && (
                <RequirePermission permission="ROLE_GESTOR">
                  <button onClick={() => setIsTransferring(true)} className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                    {execution.transferredValue ? 'Editar Repasse' : 'Registrar Repasse'}
                  </button>
                </RequirePermission>
              )}
            </div>

            {isTransferring ? (
              <div className="bg-white p-4 rounded border border-emerald-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Valor Repassado (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={transferredValue}
                      onChange={(e) => setTransferredValue(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Data do Repasse</label>
                    <input 
                      type="date" 
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setIsTransferring(false)} className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-100">
                    Cancelar
                  </button>
                  <button onClick={handleRegisterTransfer} disabled={loading} className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 flex items-center gap-2">
                    <DollarSign size={16}/> Salvar Repasse
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 font-medium">Valor Repassado (R$)</label>
                  <span className={`text-lg font-mono ${execution.transferredValue ? 'text-emerald-700 font-bold' : 'text-gray-500'}`}>
                    {execution.transferredValue ? formatCurrency(execution.transferredValue) : 'Aguardando repasse'}
                  </span>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-medium">Data do Repasse</label>
                  <span className="text-gray-900">
                    {execution.transferDate ? new Date(execution.transferDate).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {execution.blocked && execution.blockReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <h4 className="font-semibold text-red-900 flex items-center gap-2 mb-1"><Lock size={16}/> Motivo do Bloqueio</h4>
              <p className="text-sm">{execution.blockReason}</p>
            </div>
          )}

          {showBlockConfirm && !execution.blocked && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-orange-900 mb-2">Motivo do Bloqueio (Obrigatório)</label>
              <textarea 
                className="w-full border border-orange-300 rounded-md p-2 text-sm focus:ring-orange-500 focus:border-orange-500 mb-2"
                rows={3}
                placeholder="Ex: Entidade suspensa por irregularidade, falta de prestação anterior..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowBlockConfirm(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
                <button onClick={handleBlockToggle} disabled={loading} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">Confirmar Bloqueio</button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <RequirePermission permission="ROLE_GESTOR">
            {!showBlockConfirm && (
              <button 
                onClick={execution.blocked ? handleBlockToggle : () => setShowBlockConfirm(true)}
                className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 text-sm transition-colors ${
                  execution.blocked 
                    ? 'bg-white border border-green-200 text-green-700 hover:bg-green-50' 
                    : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                }`}
              >
                {execution.blocked ? <><Unlock size={16}/> Desbloquear Lançamento</> : <><Lock size={16}/> Bloquear Lançamento</>}
              </button>
            )}
            {showBlockConfirm && <div/>} {/* Placeholder for flex-between when form is active */}
          </RequirePermission>
          
          <div className="flex gap-2">
            {execution.status === 'READY_FOR_ACCOUNTABILITY' || execution.status === 'ACCOUNTABILITY_DRAFT' || execution.status === 'PENDING_CORRECTION' ? (
              <button 
                onClick={() => setShowAccountabilityModal(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2"
              >
                <FileText size={16} /> Prestar Contas
              </button>
            ) : null}
            {execution.status === 'ACCOUNTABILITY_CLOSED_UNREALIZED' && (
              <RequirePermission permission="ROLE_GESTOR">
                <button 
                  onClick={async () => {
                    const days = prompt('Deseja reabrir a prestação de contas? Informe por quantos dias (padrão: 15):', '15');
                    if (days !== null) {
                      setLoading(true);
                      try {
                        // Assuming you have an API call here. We will need to add it to accountabilityApi
                        await api.post(`/accountabilities/${execution.id}/reopen?days=${days}`);
                        alert('Prestação reaberta com sucesso.');
                        onUpdate();
                      } catch (e) {
                        alert('Erro ao reabrir prestação.');
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  disabled={loading}
                  className="bg-orange-600 text-white hover:bg-orange-700 px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2"
                >
                  <Unlock size={16} /> Reabrir Prestação
                </button>
              </RequirePermission>
            )}
            <button
              onClick={onClose}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium text-sm transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      <AccountabilityModal 
        isOpen={showAccountabilityModal}
        onClose={() => setShowAccountabilityModal(false)}
        execution={execution}
        onSuccess={() => {
          setShowAccountabilityModal(false);
          onUpdate();
        }}
      />
    </div>
  );
}
