import { useState, useEffect } from 'react';
import { Play, Filter, Lock, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';
import type { MonthlyExecution } from '../../features/executions/api';
import { monthlyExecutionApi } from '../../features/executions/api';
import { RequirePermission } from '../../features/auth/RequirePermission';
import { formatCurrency } from '../../utils/formatters';
import { MonthlyExecutionDetailsModal } from './MonthlyExecutionDetailsModal';
import { BatchTransferModal } from './BatchTransferModal';
import { ExecutionStatusBadge } from '../../features/executions/components/ExecutionStatusBadge';

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
    const confirmed = window.confirm(`Deseja gerar os lançamentos automáticos para a competência ${competence}?`);
    if (!confirmed) return;
    setIsGenerating(true);
    try {
      const result = await monthlyExecutionApi.generate(competence);
      import('react-hot-toast').then(({ default: toast }) => {
        toast.success(`${result.generated} lançamentos gerados para ${competence}.`);
      });
      fetchExecutions();
    } catch (error) {
      console.error('Erro ao gerar:', error);
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error('Erro ao gerar lançamentos.');
      });
    } finally {
      setIsGenerating(false);
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
          <div className="flex gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <select
                value={competence ? competence.split('-')[0] : ''}
                onChange={(e) => {
                  const newYear = e.target.value;
                  const currentMonth = competence ? competence.split('-')[1] : '01';
                  setCompetence(`${newYear}-${currentMonth}`);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 w-28"
              >
                <option value="">Selecione</option>
                {Array.from({ length: new Date().getFullYear() - 2015 + 2 }, (_, i) => 2015 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
              <select
                value={competence ? competence.split('-')[1] : ''}
                onChange={(e) => {
                  const newMonth = e.target.value;
                  const currentYear = competence ? competence.split('-')[0] : new Date().getFullYear().toString();
                  setCompetence(`${currentYear}-${newMonth}`);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 w-32"
              >
                <option value="">Selecione</option>
                <option value="01">Janeiro</option>
                <option value="02">Fevereiro</option>
                <option value="03">Março</option>
                <option value="04">Abril</option>
                <option value="05">Maio</option>
                <option value="06">Junho</option>
                <option value="07">Julho</option>
                <option value="08">Agosto</option>
                <option value="09">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
            </div>
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
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-gray-400">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm">Carregando lançamentos...</span>
            </div>
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
                        <ExecutionStatusBadge status={exec.status} />
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
