import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { energyApi } from '../api';
import { EnergyFlagBarChart } from '../components';
import { DollarSign, Zap, Building2, Calendar } from 'lucide-react';
import { RequirePermission } from '../../auth/RequirePermission';

export function EnergyOverviewPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['global-energy-dashboard', year],
    queryFn: () => energyApi.getGlobalDashboard(year)
  });

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

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
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Carregando painel global...</div>
      ) : dashboard ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Gasto Total ({year})</p>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">
                    {formatCurrency(dashboard.totalSpentYear)}
                  </h3>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Entidades Atendidas</p>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">
                    {dashboard.totalEntities}
                  </h3>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total de Registros</p>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">
                    {dashboard.totalRecords}
                  </h3>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Média por Entidade</p>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">
                    {dashboard.totalEntities > 0 
                      ? formatCurrency(dashboard.totalSpentYear / dashboard.totalEntities) 
                      : 'R$ 0,00'}
                  </h3>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Distribuição de Bandeiras</h3>
              <EnergyFlagBarChart flagDistribution={dashboard.flagDistribution} />
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
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
                    {dashboard.entitySummaries
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
          </div>
        </>
      ) : null}
    </div>
  );
}
