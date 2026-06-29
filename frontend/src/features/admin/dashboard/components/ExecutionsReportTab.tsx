import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../../lib/api';
import { ExportButton } from './ExportButton';
import { FileClock, Search, Filter } from 'lucide-react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateString: string) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('pt-BR').format(d);
};

export function ExecutionsReportTab() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, totalElements: 0, totalPages: 0 });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    competence: '',
  });

  const buildParams = (page: number, currentFilters: typeof filters) => {
    const params = new URLSearchParams({ page: page.toString(), size: '10' });
    if (currentFilters.search) params.append('search', currentFilters.search);
    if (currentFilters.status) params.append('status', currentFilters.status);
    if (currentFilters.competence) params.append('competence', currentFilters.competence);
    return params.toString();
  };

  const fetchData = useCallback(async (page = 0, currentFilters = filters) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports/executions?${buildParams(page, currentFilters)}`);
      setData(res.data.content ?? []);
      setPagination({
        page: res.data.number,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData(0);
  }, []);

  const handleApplyFilters = () => {
    fetchData(0);
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-slate-400" />
          <h3 className="text-sm font-medium text-slate-700">Filtros de Prestações</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Busca (Entidade/Termo)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Ex: Instituto XPTO"
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">Todos</option>
              <option value="WAITING_TRANSFER">Aguardando Repasse</option>
              <option value="READY_FOR_ACCOUNTABILITY">Pronto para Prestação</option>
              <option value="ACCOUNTABILITY_DRAFT">Prestação em Rascunho</option>
              <option value="SUBMITTED">Prestação Enviada</option>
              <option value="UNDER_REVIEW">Em Análise SEDS</option>
              <option value="PENDING_CORRECTION">Pendente de Correção</option>
              <option value="RESUBMITTED">Reenviada após Correção</option>
              <option value="APPROVED">Prestação Aprovada</option>
              <option value="REJECTED">Prestação Reprovada</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Competência</label>
            <input
              type="month"
              value={filters.competence}
              onChange={e => setFilters({ ...filters, competence: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* KPIs rápidos */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <FileClock size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total de Registros</p>
              <h4 className="text-xl font-bold text-slate-800">{pagination.totalElements}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 text-sm">Prestações de Contas</span>
          </div>
          <div className="flex gap-2">
            <ExportButton
              endpoint={`/admin/reports/executions/export?${buildParams(0, filters)}`}
              baseFilename="prestacoes"
              format="xlsx"
              variant="ghost"
              label="Excel"
            />
            <ExportButton
              endpoint={`/admin/reports/executions/export?${buildParams(0, filters)}`}
              baseFilename="prestacoes"
              format="csv"
              variant="ghost"
              label="CSV"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Entidade</th>
                <th className="px-4 py-3">Termo/Programa</th>
                <th className="px-4 py-3 text-center">Competência</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Previsto</th>
                <th className="px-4 py-3 text-right">Repassado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                data.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.entityName}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 font-medium">{item.agreementNumber}</div>
                      <div className="text-xs text-slate-500">{item.programName}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                        {item.competence}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium">{item.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(item.expectedValue)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {formatCurrency(item.transferredValue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && pagination.totalPages > 1 && (
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Página {pagination.page + 1} de {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page === 0}
                onClick={() => fetchData(pagination.page - 1)}
                className="px-3 py-1 border border-slate-300 bg-white rounded text-xs disabled:opacity-50 hover:bg-slate-50"
              >
                Anterior
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages - 1}
                onClick={() => fetchData(pagination.page + 1)}
                className="px-3 py-1 border border-slate-300 bg-white rounded text-xs disabled:opacity-50 hover:bg-slate-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
