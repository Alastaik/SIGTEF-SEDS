import { useState, useEffect } from 'react';
import { Play, Filter, Lock, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';
import type { MonthlyExecution } from '../../features/executions/api';
import { monthlyExecutionApi } from '../../features/executions/api';
import { RequirePermission } from '../../features/auth/RequirePermission';
import { formatCurrency } from '../../utils/formatters';
import { MonthlyExecutionDetailsModal } from './MonthlyExecutionDetailsModal';
import { BatchTransferModal } from './BatchTransferModal';

export function MonthlyExecutionsPage() {
  const [executions, setExecutions] = useState<MonthlyExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [competence, setCompetence] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${mm}`;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<MonthlyExecution | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Reset selected ids when fetching
  const fetchExecutions = async () => {
    setLoading(true);
    setSelectedIds([]);
    try {
      const response = await monthlyExecutionApi.findAll({ competence });
      setExecutions(response.content || []);
    } catch (error) {
      console.error('Erro ao buscar lançamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, [competence]);

  const handleGenerate = async () => {
    if (!confirm(`Deseja gerar os lançamentos automáticos para a competência ${competence}?`)) return;
    setIsGenerating(true);
    try {
      const result = await monthlyExecutionApi.generate(competence);
      alert(`${result.generated} lançamentos foram gerados com sucesso para ${competence}.`);
      fetchExecutions();
    } catch (error) {
      console.error('Erro ao gerar:', error);
      alert('Erro ao gerar lançamentos.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING_TRANSFER': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><Clock size={12}/> Aguardando Repasse</span>;
      case 'READY_FOR_ACCOUNTABILITY': return <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><CheckCircle size={12}/> Aguardando Prestação</span>;
      case 'ACCOUNTABILITY_DRAFT': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><Clock size={12}/> Rascunho</span>;
      case 'SUBMITTED': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><CheckCircle size={12}/> Prestação Enviada</span>;
      case 'UNDER_REVIEW': return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><Clock size={12}/> Em Análise SEDS</span>;
      case 'PENDING_CORRECTION': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><AlertTriangle size={12}/> Pendente de Correção</span>;
      case 'APPROVED': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><CheckCircle size={12}/> Prestação Aprovada</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><AlertTriangle size={12}/> Prestação Reprovada</span>;
      case 'CLOSED': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><Lock size={12}/> Fechado</span>;
      case 'BLOCKED': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><Lock size={12}/> Bloqueado</span>;
      case 'CANCELED': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><X size={12}/> Cancelado</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">{status}</span>;
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const selectableIds = executions
        .filter(ex => ex.status === 'WAITING_TRANSFER' && !ex.blocked)
        .map(ex => ex.id);
      setSelectedIds(selectableIds);
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectableExecutions = executions.filter(ex => ex.status === 'WAITING_TRANSFER' && !ex.blocked);
  const allSelected = selectableExecutions.length > 0 && selectedIds.length === selectableExecutions.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lançamentos Mensais (Execução)</h1>
          <p className="text-gray-500 mt-1">Gerencie e monitore o que cada entidade deve executar no mês.</p>
        </div>

        <RequirePermission permission="SETTINGS_MANAGE">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Play size={20} />
            {isGenerating ? 'Gerando...' : 'Gerar Lançamentos Automáticos'}
          </button>
        </RequirePermission>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex gap-4 items-end bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Competência</label>
            <input 
              type="month" 
              value={competence}
              onChange={(e) => setCompetence(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 w-48"
            />
          </div>
          <button 
            onClick={fetchExecutions}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors text-sm"
          >
            <Filter size={16} />
            Filtrar
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200 flex justify-between items-center">
            <span className="text-sm font-medium text-emerald-800">
              {selectedIds.length} lançamento(s) selecionado(s)
            </span>
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              Registrar Repasse em Lote
            </button>
          </div>
        )}

        <div className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : executions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <AlertTriangle size={48} className="text-yellow-400 mb-4" />
              <p>Nenhum lançamento gerado para a competência <strong>{competence}</strong>.</p>
              <p className="text-sm mt-2">Clique no botão "Gerar Lançamentos Automáticos" para criar os registros com base nos termos ativos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                    <th className="p-4 w-10">
                      <input 
                        type="checkbox" 
                        checked={allSelected}
                        onChange={handleSelectAll}
                        disabled={selectableExecutions.length === 0}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="p-4">Entidade</th>
                    <th className="p-4">Termo / Programa</th>
                    <th className="p-4">Valor Previsto</th>
                    <th className="p-4">Valor Repassado</th>
                    <th className="p-4">Meta / Dias</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {executions.map((exec) => {
                    const isSelectable = exec.status === 'WAITING_TRANSFER' && !exec.blocked;
                    return (
                    <tr key={exec.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(exec.id)}
                          onChange={() => toggleSelect(exec.id)}
                          disabled={!isSelectable}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          {exec.partnershipAgreementProgram?.partnershipAgreement?.legalEntity?.tradeName || 'Entidade'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          CNPJ: {exec.partnershipAgreementProgram?.partnershipAgreement?.legalEntity?.cnpj}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-800">
                          {exec.partnershipAgreementProgram?.program?.name}
                        </div>
                        <div className="text-xs text-indigo-600 mt-1 font-semibold">
                          Termo: {exec.partnershipAgreementProgram?.partnershipAgreement?.agreementNumber}/{exec.partnershipAgreementProgram?.partnershipAgreement?.year}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm text-gray-900">
                        {formatCurrency(exec.expectedValue)}
                      </td>
                      <td className="p-4 font-mono text-sm text-emerald-700 font-medium">
                        {exec.transferredValue ? formatCurrency(exec.transferredValue) : '-'}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {exec.expectedGoal ? <div>Meta: {exec.expectedGoal}</div> : null}
                        {exec.expectedServiceDays ? <div>Dias: {exec.expectedServiceDays}</div> : null}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(exec.status)}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setSelectedExecution(exec)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {selectedExecution && (
        <MonthlyExecutionDetailsModal
          execution={selectedExecution}
          onClose={() => setSelectedExecution(null)}
          onUpdate={() => {
            fetchExecutions();
            // Refetch or update just the selected one if we wanted to avoid full reload
            // But full reload is safer for now
            setSelectedExecution(null);
          }}
        />
      )}

      <BatchTransferModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        executionIds={selectedIds}
        onSuccess={() => {
          setIsBatchModalOpen(false);
          fetchExecutions();
        }}
      />
    </div>
  );
}
