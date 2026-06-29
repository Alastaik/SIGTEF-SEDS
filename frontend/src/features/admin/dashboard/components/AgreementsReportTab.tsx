import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../../lib/api';
import { FileText, Search, AlertTriangle } from 'lucide-react';
import { ExportButton } from './ExportButton';

type Agreement = {
  id: string;
  agreementNumber: string;
  entityName: string;
  entityCnpj: string;
  status: string;
  programs: string[];
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number;
  globalValue: number;
  transferredValue: number;
  percentExecuted: number;
  city: string;
  region: string;
};

const statusLabels: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Rascunho', className: 'bg-slate-100 text-slate-700' },
  ACTIVE: { label: 'Ativo', className: 'bg-emerald-100 text-emerald-700' },
  SUSPENDED: { label: 'Suspenso', className: 'bg-amber-100 text-amber-700' },
  EXPIRED: { label: 'Vencido', className: 'bg-red-100 text-red-700' },
  CLOSED: { label: 'Encerrado', className: 'bg-slate-100 text-slate-600' },
  CANCELED: { label: 'Cancelado', className: 'bg-red-100 text-red-600' },
  UNDER_RENEWAL: { label: 'Em Renovação', className: 'bg-blue-100 text-blue-700' },
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const formatDate = (d: string | null) => {
  if (!d) return '—';
  const [year, month, day] = d.split('-');
  return `${day}/${month}/${year}`;
};

function DaysRemainingBadge({ days }: { days: number }) {
  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <AlertTriangle size={11} />
        Vencido {Math.abs(days)}d
      </span>
    );
  }
  if (days < 30) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
        <AlertTriangle size={11} />
        {days}d restantes
      </span>
    );
  }
  if (days < 90) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        {days}d restantes
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
      {days}d restantes
    </span>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const color =
    clamped >= 90
      ? 'bg-emerald-500'
      : clamped >= 50
      ? 'bg-blue-500'
      : 'bg-amber-400';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-600 w-10 text-right">
        {clamped.toFixed(1)}%
      </span>
    </div>
  );
}

export function AgreementsReportTab() {
  const [data, setData] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filtros locais desta aba
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    expiresInDays: '',
    expired: false,
  });

  const fetchData = useCallback(async (p = 0, f = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p.toString(), size: '10' });
      if (f.search) params.append('search', f.search);
      if (f.status) params.append('status', f.status);
      if (f.expired) {
        params.append('expired', 'true');
      } else if (f.expiresInDays) {
        params.append('expiresInDays', f.expiresInDays);
      }

      const res = await api.get(`/admin/reports/agreements?${params.toString()}`);
      setData(res.data.content ?? []);
      setTotalPages(res.data.totalPages ?? 0);
      setTotalElements(res.data.totalElements ?? 0);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData(0, filters);
  }, []);

  const handleApply = () => fetchData(0, filters);

  const handleClear = () => {
    const cleared = { search: '', status: '', expiresInDays: '', expired: false };
    setFilters(cleared);
    fetchData(0, cleared);
  };

  return (
    <div className="space-y-4">
      {/* Filtros da aba Termos */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Busca */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por entidade ou número do termo..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>

          {/* Status */}
          <select
            className="p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">Todos os Status</option>
            {Object.entries(statusLabels).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Vencimento */}
          <select
            className="p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
            value={filters.expired ? 'expired' : filters.expiresInDays}
            onChange={e => {
              const val = e.target.value;
              if (val === 'expired') {
                setFilters(f => ({ ...f, expired: true, expiresInDays: '' }));
              } else {
                setFilters(f => ({ ...f, expired: false, expiresInDays: val }));
              }
            }}
          >
            <option value="">Qualquer vencimento</option>
            <option value="30">Vencendo em 30 dias</option>
            <option value="60">Vencendo em 60 dias</option>
            <option value="90">Vencendo em 90 dias</option>
            <option value="expired">Vencidos</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500">{totalElements} termo(s) encontrado(s)</span>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Limpar
            </button>
            <button
              onClick={handleApply}
              disabled={loading}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Aplicar'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
            <FileText size={16} />
            Termos de Fomento
          </h3>
          <div className="flex gap-2">
            <ExportButton
              endpoint="/admin/reports/entities/export"
              baseFilename="termos"
              format="xlsx"
              variant="ghost"
              label="Excel"
            />
            <ExportButton
              endpoint="/admin/reports/entities/export"
              baseFilename="termos"
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
                <th className="px-4 py-3">Entidade / Número</th>
                <th className="px-4 py-3">Programas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Vigência</th>
                <th className="px-4 py-3">Prazo</th>
                <th className="px-4 py-3 text-right">Valor Global</th>
                <th className="px-4 py-3 w-48">% Executado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Nenhum termo encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                data.map(item => {
                  const st = statusLabels[item.status] ?? { label: item.status, className: 'bg-slate-100 text-slate-600' };
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 truncate max-w-[220px]">{item.entityName}</p>
                        <p className="text-xs text-slate-400">{item.agreementNumber ?? 'S/N'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {item.programs?.length ? (
                            item.programs.map((p, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">{p}</span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.className}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">
                        {formatDate(item.startDate)} → {formatDate(item.endDate)}
                      </td>
                      <td className="px-4 py-3">
                        <DaysRemainingBadge days={item.daysRemaining} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">
                        {formatCurrency(item.globalValue)}
                      </td>
                      <td className="px-4 py-3">
                        <ProgressBar percent={item.percentExecuted} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Página {page + 1} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => fetchData(page - 1)}
                className="px-3 py-1 border border-slate-300 bg-white rounded text-xs disabled:opacity-50 hover:bg-slate-50"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => fetchData(page + 1)}
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
