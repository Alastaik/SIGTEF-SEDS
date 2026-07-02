import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import { FileText, Clock, AlertTriangle, CheckCircle, XCircle, Search } from 'lucide-react';
import { format } from 'date-fns';

export function PortalAccountabilities() {
  const [accountabilities, setAccountabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [competenceFilter, setCompetenceFilter] = useState('');

  const fetchAccountabilities = async () => {
    setLoading(true);
    try {
      // Buscamos as competências mas podemos filtrar no frontend por aquelas que não são PENDING
      // O ideal seria passar um status diferente, mas vamos listar todas que têm envio
      const response = await api.get('/portal/competences', {
        params: {
          competence: competenceFilter || undefined
        }
      });
      
      // Filtra competências que já tiveram algum passo de prestação (não são PENDING ou PENDING_ACCOUNTABILITY)
      // Isso assume que o backend gerencia status de MonthlyExecution para refletir a prestação.
      const filtered = (response.data.content || []).filter((comp: any) => 
        comp.status !== 'PENDING' && comp.status !== 'PENDING_ACCOUNTABILITY'
      );
      
      setAccountabilities(filtered);
    } catch (error) {
      console.error('Erro ao buscar prestações', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountabilities();
  }, [competenceFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1 w-fit"><FileText size={14}/> Rascunho</span>;
      case 'SUBMITTED':
      case 'RESUBMITTED':
      case 'UNDER_REVIEW':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1 w-fit"><FileText size={14}/> Em Análise</span>;
      case 'APPROVED':
      case 'CLOSED':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1 w-fit"><CheckCircle size={14}/> Aprovada</span>;
      case 'REJECTED':
      case 'CANCELED':
      case 'BLOCKED':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-1 w-fit"><XCircle size={14}/> Reprovada / Bloqueada</span>;
      case 'PENDING_CORRECTION':
        return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium flex items-center gap-1 w-fit"><AlertTriangle size={14}/> Pendente de Correção</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium w-fit">{status}</span>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando histórico de prestações...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Histórico de Prestações</h1>
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
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por competência ou programa..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {accountabilities.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <FileText size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma prestação enviada</h3>
            <p className="text-gray-500 max-w-sm">
              Você ainda não enviou nenhuma prestação de contas. Elas aparecerão aqui assim que forem submetidas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 block md:table">
              <thead className="bg-white border-b border-gray-200 text-gray-700 hidden md:table-header-group">
                <tr className="block md:table-row">
                  <th className="px-6 py-4 font-semibold block md:table-cell">Competência</th>
                  <th className="px-6 py-4 font-semibold block md:table-cell">Programa</th>
                  <th className="px-6 py-4 font-semibold block md:table-cell">Valor Repassado</th>
                  <th className="px-6 py-4 font-semibold block md:table-cell">Status</th>
                  <th className="px-6 py-4 font-semibold text-right block md:table-cell">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 block md:table-row-group">
                {accountabilities.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50 transition-colors block md:table-row bg-white border-b border-gray-100 md:border-none mb-4 md:mb-0 shadow-sm md:shadow-none rounded-lg md:rounded-none">
                    <td className="px-6 py-4 font-medium text-gray-900 block md:table-cell flex items-center justify-between md:justify-start">
                      <span className="md:hidden font-semibold text-gray-500">Competência:</span>
                      {acc.competence}
                    </td>
                    <td className="px-6 py-4 block md:table-cell">
                      <span className="md:hidden font-semibold text-gray-500 block mb-1">Programa:</span>
                      {acc.partnershipAgreementProgram?.program?.name}
                    </td>
                    <td className="px-6 py-4 block md:table-cell flex justify-between md:justify-start items-center">
                      <span className="md:hidden font-semibold text-gray-500">Valor Repassado:</span>
                      {formatCurrency(acc.transferredValue || 0)}
                    </td>
                    <td className="px-6 py-4 block md:table-cell flex justify-between md:justify-start items-center">
                      <span className="md:hidden font-semibold text-gray-500">Status:</span>
                      {getStatusBadge(acc.status)}
                    </td>
                    <td className="px-6 py-4 text-right block md:table-cell flex justify-center md:justify-end border-t md:border-t-0 mt-2 md:mt-0 pt-4 md:pt-4">
                      <Link 
                        to={`/portal/accountabilities/${acc.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Ver Detalhes
                      </Link>
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
