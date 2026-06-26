import React, { useState, useEffect } from 'react';
import { monthlyExecutionApi } from '../../features/executions/api';
import type { MonthlyExecution } from '../../features/executions/api';
import { Search, Filter, FileText } from 'lucide-react';
import { AccountabilityAnalysisModal } from './AccountabilityAnalysisModal';
import { ExecutionStatusBadge } from '../../features/executions/components/ExecutionStatusBadge';

export function AccountabilityAnalysisList() {
  const [executions, setExecutions] = useState<MonthlyExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<MonthlyExecution | null>(null);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      // Carregar todas que estão SUBMITTED ou PENDING_CORRECTION etc, mas a API não suporta array no status ainda, então buscamos tudo e filtramos
      const response = await monthlyExecutionApi.findAll({ size: 1000 });
      const analysisExecutions = (response.content || []).filter((e: MonthlyExecution) => 
        e.status === 'SUBMITTED' || e.status === 'UNDER_REVIEW' || e.status === 'RESUBMITTED'
      );
      setExecutions(analysisExecutions);
    } catch (error) {
      console.error('Failed to load executions for analysis', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecutions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Análise de Prestações de Contas</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por entidade ou convênio..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter size={20} />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Convênio / Programa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competência</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Previsto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Carregando prestações pendentes de análise...
                  </td>
                </tr>
              ) : executions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma prestação de contas aguardando análise no momento.
                  </td>
                </tr>
              ) : (
                executions.map((execution) => (
                  <tr key={execution.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {execution.partnershipAgreementProgram?.partnershipAgreement?.legalEntity?.tradeName}
                      </div>
                      <div className="text-xs text-gray-500">
                        CNPJ: {execution.partnershipAgreementProgram?.partnershipAgreement?.legalEntity?.cnpj}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        Nº {execution.partnershipAgreementProgram?.partnershipAgreement?.agreementNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {execution.partnershipAgreementProgram?.program?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {execution.competence}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(execution.expectedValue)}
                    </td>
                    <td className="px-6 py-4">
                      <ExecutionStatusBadge status={execution.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedExecution(execution)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-900 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <FileText size={16} />
                        Analisar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedExecution && (
        <AccountabilityAnalysisModal
          isOpen={true}
          onClose={() => setSelectedExecution(null)}
          execution={selectedExecution}
          onSuccess={() => {
            setSelectedExecution(null);
            loadExecutions();
          }}
        />
      )}
    </div>
  );
}
