import { useState, useEffect } from 'react';
import type { LegalEntity } from '../../types/entity';
import { api } from '../../../../lib/api';
import { DollarSign, TrendingUp, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  entity: LegalEntity;
}

interface YearSummary { year: number; total: number; }
interface ProgramSummary { programName: string; total: number; }
interface FinancialSummary {
  entityId: string;
  entityName: string;
  cnpj: string;
  yearStart: number | null;
  yearEnd: number | null;
  totalTransferred: number;
  byYear: YearSummary[];
  byProgram: ProgramSummary[];
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => 2010 + i).reverse();

export function EntityFinancialTab({ entity }: Props) {
  const [yearStart, setYearStart] = useState<string>('');
  const [yearEnd, setYearEnd] = useState<string>('');
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = async (ys?: string, ye?: string) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (ys) params.append('yearStart', ys);
      if (ye) params.append('yearEnd', ye);
      const res = await api.get(
        `/admin/reports/entities/${entity.id}/financial-summary?${params.toString()}`
      );
      setData(res.data);
    } catch {
      setError('Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, [entity.id]);

  const handleApply = () => fetchSummary(yearStart, yearEnd);
  const handleClear = () => {
    setYearStart('');
    setYearEnd('');
    fetchSummary();
  };

  const maxYear = data?.byYear.reduce((m, y) => y.total > m.total ? y : m, { year: 0, total: 0 });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <DollarSign size={20} className="text-emerald-600" />
          Histórico Financeiro
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Consulte o total repassado para esta entidade em qualquer período.
        </p>
      </div>

      {/* Filtro de período */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Filtrar por período</p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ano Início</label>
            <select
              className="w-36 p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
              value={yearStart}
              onChange={e => setYearStart(e.target.value)}
            >
              <option value="">Todos</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ano Fim</label>
            <select
              className="w-36 p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
              value={yearEnd}
              onChange={e => setYearEnd(e.target.value)}
            >
              <option value="">Todos</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Calculando...' : 'Aplicar'}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm">{error}</div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
          Calculando...
        </div>
      )}

      {!loading && data && (
        <>
          {/* Card total */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-sm font-medium text-emerald-100">
              {data.yearStart && data.yearEnd
                ? `Total repassado de ${data.yearStart} a ${data.yearEnd}`
                : data.yearStart
                ? `Total repassado a partir de ${data.yearStart}`
                : data.yearEnd
                ? `Total repassado até ${data.yearEnd}`
                : 'Total repassado (histórico completo)'}
            </p>
            <h3 className="text-3xl font-bold mt-1">
              {formatCurrency(data.totalTransferred)}
            </h3>
            <p className="text-emerald-200 text-xs mt-2">{entity.corporateName}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tabela por ano */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Evolução por Ano</span>
              </div>
              {data.byYear.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">Nenhum repasse registrado neste período.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Ano</th>
                      <th className="px-4 py-2 text-right">Valor Repassado</th>
                      <th className="px-4 py-2 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.byYear.map(row => {
                      const pct = data.totalTransferred > 0
                        ? ((row.total / data.totalTransferred) * 100).toFixed(1)
                        : '0.0';
                      const isMax = maxYear && row.year === maxYear.year;
                      return (
                        <tr key={row.year} className={`hover:bg-slate-50 ${isMax ? 'font-semibold' : ''}`}>
                          <td className="px-4 py-2.5 text-slate-800">
                            {row.year}
                            {isMax && (
                              <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">pico</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-700">{formatCurrency(row.total)}</td>
                          <td className="px-4 py-2.5 text-right text-slate-500">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Tabela por programa */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <BarChart2 size={16} className="text-indigo-600" />
                <span className="text-sm font-semibold text-slate-700">Distribuição por Programa</span>
              </div>
              {data.byProgram.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">Nenhum programa registrado neste período.</p>
              ) : (
                <div className="p-4 space-y-3">
                  {data.byProgram.map((prog, i) => {
                    const pct = data.totalTransferred > 0
                      ? (prog.total / data.totalTransferred) * 100
                      : 0;
                    const colors = [
                      'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
                      'bg-purple-500', 'bg-pink-500', 'bg-emerald-500',
                    ];
                    const color = colors[i % colors.length];
                    return (
                      <div key={prog.programName}>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="font-medium text-slate-700 truncate max-w-[60%]" title={prog.programName}>
                            {prog.programName}
                          </span>
                          <span className="text-slate-600">{formatCurrency(prog.total)}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${color} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-right text-xs text-slate-400 mt-0.5">{pct.toFixed(1)}%</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
