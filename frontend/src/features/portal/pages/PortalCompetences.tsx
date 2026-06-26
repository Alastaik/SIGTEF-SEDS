import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { FileText, ArrowRight, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PortalCompetences() {
  const [competences, setCompetences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [competenceFilter, setCompetenceFilter] = useState(''); // Formato YYYY-MM

  const fetchCompetences = async () => {
    setLoading(true);
    try {
      const response = await api.get('/portal/competences', {
        params: {
          competence: competenceFilter || undefined
        }
      });
      // A API retorna um Page<MonthlyExecution>, então precisamos pegar o content
      setCompetences(response.data.content || []);
    } catch (error) {
      console.error('Erro ao buscar competências', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetences();
  }, [competenceFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12}/> Pendente</span>;
      case 'PENDING_ACCOUNTABILITY':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium flex items-center gap-1"><AlertTriangle size={12}/> Aguardando Prestação</span>;
      case 'SUBMITTED':
      case 'RESUBMITTED':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1"><FileText size={12}/> Em Análise</span>;
      case 'APPROVED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle size={12}/> Aprovado</span>;
      case 'PENDING_CORRECTION':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1"><AlertTriangle size={12}/> Correção Solicitada</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando competências...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Competências</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-4 items-end">
        <div className="flex gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
            <select
              value={competenceFilter ? competenceFilter.split('-')[0] : ''}
              onChange={(e) => {
                const newYear = e.target.value;
                if (!newYear) {
                  setCompetenceFilter('');
                  return;
                }
                const currentMonth = competenceFilter ? competenceFilter.split('-')[1] : '01';
                setCompetenceFilter(`${newYear}-${currentMonth}`);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 w-28"
            >
              <option value="">Todos</option>
              {Array.from({ length: new Date().getFullYear() - 2015 + 2 }, (_, i) => 2015 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
            <select
              value={competenceFilter ? competenceFilter.split('-')[1] : ''}
              onChange={(e) => {
                const newMonth = e.target.value;
                const currentYear = competenceFilter ? competenceFilter.split('-')[0] : new Date().getFullYear().toString();
                if (!newMonth && !competenceFilter.split('-')[0]) {
                   setCompetenceFilter('');
                } else if (newMonth) {
                   setCompetenceFilter(`${currentYear}-${newMonth}`);
                }
              }}
              disabled={!competenceFilter.split('-')[0]}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 w-32 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">Todos</option>
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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {competences.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhuma competência encontrada para esta entidade.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Competência</th>
                  <th className="px-6 py-4 font-semibold">Programa</th>
                  <th className="px-6 py-4 font-semibold">Valor Previsto</th>
                  <th className="px-6 py-4 font-semibold">Repasse</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {competences.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {comp.competence}
                    </td>
                    <td className="px-6 py-4">
                      {comp.partnershipAgreementProgram?.program?.name}
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(comp.expectedValue || 0)}
                    </td>
                    <td className="px-6 py-4">
                      {comp.transferredValue ? (
                        <div>
                          <div className="text-gray-900 font-medium">{formatCurrency(comp.transferredValue)}</div>
                          <div className="text-xs text-gray-500">{comp.transferDate ? format(new Date(comp.transferDate), 'dd/MM/yyyy') : ''}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Aguardando</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(comp.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {comp.status === 'PENDING_ACCOUNTABILITY' || comp.status === 'PENDING_CORRECTION' ? (
                        <button className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm">
                          Prestar Contas <ArrowRight size={16} className="ml-1" />
                        </button>
                      ) : (
                        <button className="inline-flex items-center text-gray-500 hover:text-gray-700 font-medium text-sm">
                          Ver Detalhes
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
