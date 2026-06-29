import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../../lib/api';
import { ExportButton } from './ExportButton';
import { AlertCircle, Search, Filter } from 'lucide-react';

const formatDate = (dateString: string) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('pt-BR').format(d);
};

export function IssuesReportTab() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, totalElements: 0, totalPages: 0 });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    overdue: false,
  });

  const buildParams = (page: number, currentFilters: typeof filters) => {
    const params = new URLSearchParams({ page: page.toString(), size: '10' });
    if (currentFilters.search) params.append('search', currentFilters.search);
    if (currentFilters.status) params.append('status', currentFilters.status);
    if (currentFilters.priority) params.append('priority', currentFilters.priority);
    if (currentFilters.overdue) params.append('overdue', 'true');
    return params.toString();
  };

  const fetchData = useCallback(async (page = 0, currentFilters = filters) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports/issues?${buildParams(page, currentFilters)}`);
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
          <h3 className="text-sm font-medium text-slate-700">Filtros de Pendências</h3>
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
              <option value="OPEN">Aberta</option>
              <option value="NOTIFIED">Notificada</option>
              <option value="ANSWERED">Respondida</option>
              <option value="UNDER_REVIEW">Em Análise</option>
              <option value="RESOLVED">Resolvida</option>
              <option value="REJECTED_RESPONSE">Resposta Recusada</option>
              <option value="EXPIRED">Vencida</option>
              <option value="REOPENED">Reaberta</option>
              <option value="CANCELED">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Prioridade</label>
            <select
              value={filters.priority}
              onChange={e => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">Todas</option>
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="CRITICAL">Crítica</option>
            </select>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={filters.overdue}
                onChange={e => setFilters({ ...filters, overdue: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600"
              />
              <span className="text-sm text-slate-700">Apenas Atrasadas</span>
            </label>
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
            <div className="w-11 h-11 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Pendências Listadas</p>
              <h4 className="text-xl font-bold text-slate-800">{pagination.totalElements}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 text-sm">Registro de Pendências</span>
          </div>
          <div className="flex gap-2">
            <ExportButton
              endpoint={`/admin/reports/issues/export?${buildParams(0, filters)}`}
              baseFilename="pendencias"
              format="xlsx"
              variant="ghost"
              label="Excel"
            />
            <ExportButton
              endpoint={`/admin/reports/issues/export?${buildParams(0, filters)}`}
              baseFilename="pendencias"
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
                <th className="px-4 py-3">Entidade / Termo</th>
                <th className="px-4 py-3 text-center">Competência</th>
                <th className="px-4 py-3">Descrição / Tipo</th>
                <th className="px-4 py-3 text-center">Prioridade</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Prazo</th>
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
                    <td className="px-4 py-3">
                      <div className="text-slate-800 font-medium">{item.entityName}</div>
                      <div className="text-xs text-slate-500">{item.agreementNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-slate-600 font-medium">{item.competence}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={item.description}>
                      <div className="text-slate-800 text-xs font-medium">{item.issueType}</div>
                      <div className="text-slate-500 text-xs truncate">{item.description}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                        item.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        item.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={`text-sm ${item.overdue ? 'text-rose-600 font-semibold' : 'text-slate-700'}`}>
                        {formatDate(item.deadline)}
                      </div>
                      {item.overdue && (
                        <div className="text-[10px] font-bold text-rose-500 uppercase mt-0.5">Atrasado</div>
                      )}
                      {item.resolvedAt && (
                        <div className="text-[10px] text-emerald-600 mt-0.5">
                          Resolvido: {formatDate(item.resolvedAt)}
                        </div>
                      )}
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
