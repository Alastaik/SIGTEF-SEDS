import React from 'react';
import type { EnergyDashboard } from '../types';
import { DollarSign, Zap, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface Props {
  dashboard: EnergyDashboard;
}

export function EnergyStatsCards({ dashboard }: Props) {
  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  
  const momChange = dashboard.momChangePercentage;
  const isMomIncrease = momChange > 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">Custo Médio (Mensal)</p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">
              {formatCurrency(dashboard.avgValue)}
            </h3>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">Consumo Médio (Mensal)</p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">
              {dashboard.avgKwh?.toLocaleString('pt-BR')} kWh
            </h3>
          </div>
          <div className="p-2 bg-amber-50 rounded-lg">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">Variação (Mês anterior)</p>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-xl font-bold text-slate-800">
                {momChange ? Math.abs(momChange).toFixed(1) + '%' : 'N/A'}
              </h3>
              {momChange !== undefined && momChange !== null && (
                <span className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                  isMomIncrease ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {isMomIncrease ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {isMomIncrease ? 'Alta' : 'Queda'}
                </span>
              )}
            </div>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">Custo por kWh Médio</p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">
              {formatCurrency(dashboard.avgUnitCost)} / kWh
            </h3>
          </div>
          <div className="p-2 bg-indigo-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
