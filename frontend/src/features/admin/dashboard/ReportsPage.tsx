import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../lib/api';
import { FileText, Building2, Wallet, BarChart2, FileClock, AlertCircle } from 'lucide-react';
import { AdvancedFilterPanel } from './components/AdvancedFilterPanel';
import type { ReportFilter } from './components/AdvancedFilterPanel';
import { AgreementsReportTab } from './components/AgreementsReportTab';
import { ExecutionsReportTab } from './components/ExecutionsReportTab';
import { IssuesReportTab } from './components/IssuesReportTab';
import { ExportButton } from './components/ExportButton';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

type Tab = 'entities' | 'agreements' | 'executions' | 'issues';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('entities');

  // ---- Estado da aba Entidades ----
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, totalElements: 0, totalPages: 0 });
  const [currentFilters, setCurrentFilters] = useState<ReportFilter>({
    search: '',
    entityStatus: '',
    cityId: '',
    regionId: '',
    regioesIds: [],
    programIds: [],
    programMatchMode: 'CONTAINS',
    minMensal: '',
    maxMensal: '',
    minAnual: '',
    maxAnual: '',
    minGlobal: '',
    maxGlobal: '',
    dataCadastroInicio: '',
    dataCadastroFim: ''
  });

  const buildParams = (page: number, filters: ReportFilter) => {
    const params = new URLSearchParams({ page: page.toString(), size: '10' });
    if (filters.search) params.append('search', filters.search);
    if (filters.entityStatus) params.append('entityStatus', filters.entityStatus);
    if (filters.cityId) params.append('cityId', filters.cityId);
    if (filters.regionId) params.append('regionId', filters.regionId);
    if (filters.programMatchMode) params.append('programMatchMode', filters.programMatchMode);
    if (filters.minMensal) params.append('minMensal', filters.minMensal);
    if (filters.maxMensal) params.append('maxMensal', filters.maxMensal);
    if (filters.minAnual) params.append('minAnual', filters.minAnual);
    if (filters.maxAnual) params.append('maxAnual', filters.maxAnual);
    if (filters.minGlobal) params.append('minGlobal', filters.minGlobal);
    if (filters.maxGlobal) params.append('maxGlobal', filters.maxGlobal);
    if (filters.dataCadastroInicio) params.append('dataCadastroInicio', filters.dataCadastroInicio);
    if (filters.dataCadastroFim) params.append('dataCadastroFim', filters.dataCadastroFim);
    filters.regioesIds?.forEach(id => params.append('regioesIds', id));
    filters.programIds?.forEach(id => params.append('programIds', id));
    return params.toString();
  };

  const fetchData = useCallback(async (page = 0, filters = currentFilters) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports/entities?${buildParams(page, filters)}`);
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
  }, [currentFilters]);

  useEffect(() => {
    if (activeTab === 'entities') fetchData(0, currentFilters);
  }, [activeTab]);

  const handleFilter = (f: ReportFilter) => {
    setCurrentFilters(f);
    fetchData(0, f);
  };

  const totalTransferred = data.reduce((acc, cur) => acc + (cur.totalTransferred || 0), 0);

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'entities', label: 'Entidades', icon: Building2 },
    { key: 'agreements', label: 'Termos de Fomento', icon: FileText },
    { key: 'executions', label: 'Prestações por Competência', icon: FileClock },
    { key: 'issues', label: 'Pendências', icon: AlertCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart2 className="text-blue-600" size={26} />
            Relatórios Gerenciais
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consulte, filtre e exporte dados consolidados do sistema.
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto custom-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Aba: Entidades */}
      {activeTab === 'entities' && (
        <div className="space-y-4">
          <AdvancedFilterPanel onFilter={handleFilter} loading={loading} />

          {/* KPIs rápidos */}
          {!loading && data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Building2 size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Nesta página</p>
                  <h4 className="text-xl font-bold text-slate-800">{data.length} entidades</h4>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <FileText size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Total de registros</p>
                  <h4 className="text-xl font-bold text-slate-800">{pagination.totalElements}</h4>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Wallet size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Total repassado (pág.)</p>
                  <h4 className="text-lg font-bold text-slate-800">{formatCurrency(totalTransferred)}</h4>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de Entidades */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 text-sm">Entidades</span>
                <span className="text-xs font-medium bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full">
                  {pagination.totalElements} registros
                </span>
              </div>
              <div className="flex gap-2">
                <ExportButton
                  endpoint="/admin/reports/entities/export"
                  baseFilename="entidades"
                  format="xlsx"
                  variant="ghost"
                  label="Excel"
                />
                <ExportButton
                  endpoint="/admin/reports/entities/export"
                  baseFilename="entidades"
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
                    <th className="px-4 py-3">CNPJ</th>
                    <th className="px-4 py-3">Localidade</th>
                    <th className="px-4 py-3 text-center">Programas Ativos</th>
                    <th className="px-4 py-3 text-center">Termos (Ativos/Total)</th>
                    <th className="px-4 py-3 text-right">Total Repassado</th>
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
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {item.name}
                          <div className="text-xs text-slate-400 mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              item.status === 'ATIVA'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}>{item.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{item.cnpj}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {item.city} {item.region ? `· ${item.region}` : ''}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap justify-center gap-1">
                            {item.activePrograms?.length ? (
                              item.activePrograms.map((p: string, i: number) => (
                                <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">{p}</span>
                              ))
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-medium text-blue-600">{item.activeAgreements}</span>
                          <span className="text-slate-300 mx-1">/</span>
                          <span className="text-slate-500">{item.totalAgreements}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-800 text-sm">
                          {formatCurrency(item.totalTransferred)}
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
      )}

      {/* Aba: Termos de Fomento */}
      {activeTab === 'agreements' && <AgreementsReportTab />}

      {/* Aba: Prestações */}
      {activeTab === 'executions' && <ExecutionsReportTab />}

      {/* Aba: Pendências */}
      {activeTab === 'issues' && <IssuesReportTab />}
    </div>
  );
}
