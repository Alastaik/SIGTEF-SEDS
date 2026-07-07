import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { energyApi } from '../api';
import { EnergyGlobalBI } from '../components';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { RequirePermission } from '../../auth/RequirePermission';

export function EnergyOverviewPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['global-energy-dashboard', year],
    queryFn: () => energyApi.getGlobalDashboard(year)
  });

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await energyApi.exportRecords(year);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consumo_energia_global_${year}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data', error);
      toast.error('Erro ao exportar os dados');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão Geral: Auxílio Energia</h1>
          <p className="text-sm text-slate-500">Acompanhamento global do programa de auxílio energia</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Ano Base:</label>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="ml-4 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Download size={18} />
            {isExporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Carregando painel global...</div>
      ) : dashboard ? (
        <>
          <EnergyGlobalBI dashboard={dashboard} />

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col mt-6">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-base font-semibold text-slate-800">Maiores Consumidores</h3>
              </div>
              <div className="overflow-y-auto flex-1 max-h-[350px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-medium">Entidade</th>
                      <th className="px-6 py-3 font-medium">Lançamentos</th>
                      <th className="px-6 py-3 font-medium">Consumo Total</th>
                      <th className="px-6 py-3 font-medium text-right">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(dashboard.entitySummaries ?? [])
                      .sort((a, b) => b.totalValue - a.totalValue)
                      .slice(0, 50)
                      .map((summary) => (
                      <tr 
                        key={summary.legalEntityId} 
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/admin/entities/${summary.legalEntityId}/energia`)}
                      >
                        <td className="px-6 py-4 font-medium text-blue-600 hover:underline">{summary.legalEntityName}</td>
                        <td className="px-6 py-4 text-slate-600">{summary.monthsRecorded}</td>
                        <td className="px-6 py-4 text-slate-600">{summary.totalKwh.toLocaleString('pt-BR')} kWh</td>
                        <td className="px-6 py-4 font-medium text-slate-900 text-right">
                          {formatCurrency(summary.totalValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </>
      ) : null}
    </div>
  );
}
