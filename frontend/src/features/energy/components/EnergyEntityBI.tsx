import React, { useState, useMemo } from 'react';
import type { EnergyDashboard } from '../types';
import { 
  ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Filter, Calendar, Zap, DollarSign, Activity } from 'lucide-react';

interface Props {
  dashboard: EnergyDashboard;
}

const FLAG_COLORS: Record<string, string> = {
  'VERDE': '#22c55e',
  'AMARELA': '#eab308',
  'VERMELHA_PATAMAR_1': '#f97316',
  'VERMELHA_PATAMAR_2': '#ef4444',
  'ESCASSEZ_HIDRICA': '#a855f7'
};

const FLAG_LABELS: Record<string, string> = {
  'VERDE': 'Verde',
  'AMARELA': 'Amarela',
  'VERMELHA_PATAMAR_1': 'Vermelha 1',
  'VERMELHA_PATAMAR_2': 'Vermelha 2',
  'ESCASSEZ_HIDRICA': 'Escassez Hídrica'
};

export function EnergyEntityBI({ dashboard }: Props) {
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');

  const availableYears = useMemo(() => {
    const years = new Set(dashboard.records.map(r => r.competenceYear).filter((y): y is number => y !== undefined));
    return Array.from(years).sort((a, b) => b - a);
  }, [dashboard.records]);

  const availableUnits = useMemo(() => {
    const units = new Set(dashboard.records.map(r => r.consumerUnitNumber).filter(Boolean));
    return Array.from(units) as string[];
  }, [dashboard.records]);

  const filteredRecords = useMemo(() => {
    return dashboard.records.filter(r => {
      const yearStr = r.competenceYear !== undefined ? r.competenceYear.toString() : '';
      if (selectedYear !== 'ALL' && yearStr !== selectedYear) return false;
      if (selectedUnit !== 'ALL' && r.consumerUnitNumber !== selectedUnit) return false;
      return true;
    });
  }, [dashboard.records, selectedYear, selectedUnit]);

  const chartData = useMemo(() => {
    const data = filteredRecords.slice().reverse().map(record => ({
      name: record.competenceDisplay,
      kwh: record.kwhAmount,
      valor: record.totalValue,
      custoUnitario: record.kwhUnitCost,
      flag: record.tariffFlag
    }));
    return data;
  }, [filteredRecords]);

  const flagPieData = useMemo(() => {
    const costByFlag: Record<string, number> = {};
    filteredRecords.forEach(r => {
      costByFlag[r.tariffFlag] = (costByFlag[r.tariffFlag] || 0) + r.totalValue;
    });
    return Object.entries(costByFlag).map(([flag, cost]) => ({
      name: FLAG_LABELS[flag] || flag,
      originalFlag: flag,
      value: cost
    })).sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const totalCost = filteredRecords.reduce((acc, r) => acc + r.totalValue, 0);
  const totalKwh = filteredRecords.reduce((acc, r) => acc + r.kwhAmount, 0);
  const avgUnitCost = totalKwh > 0 ? totalCost / totalKwh : 0;

  if (dashboard.records.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
        Nenhum dado de energia registrado para esta entidade.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* FILTERS BAR */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-700 font-medium mr-4">
          <Filter size={18} className="text-emerald-600" />
          Filtros de Análise:
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <select 
            className="text-sm border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            <option value="ALL">Todos os Anos</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {availableUnits.length > 0 && (
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-slate-400" />
            <select 
              className="text-sm border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={selectedUnit}
              onChange={e => setSelectedUnit(e.target.value)}
            >
              <option value="ALL">Todas as UCs</option>
              {availableUnits.map(u => <option key={u} value={u}>UC {u}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* KPI CARDS (Filtered) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
            <DollarSign size={100} />
          </div>
          <p className="text-emerald-200 text-sm font-medium">Custo Total (Filtro)</p>
          <h3 className="text-3xl font-black mt-2">{formatCurrency(totalCost)}</h3>
          <p className="text-emerald-300/70 text-xs mt-2">{filteredRecords.length} faturas analisadas</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Consumo Total</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">{totalKwh.toLocaleString('pt-BR')} <span className="text-sm font-normal text-slate-500">kWh</span></h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <Zap className="text-amber-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Preço Médio / kWh</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">{formatCurrency(avgUnitCost)}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Activity className="text-blue-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-6">Evolução de Custo x Consumo</h3>
          {chartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `R$ ${val}`} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val} kWh`} axisLine={false} tickLine={false} />
                  
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any, name: any) => {
                      if (name === 'Custo (R$)') return [`R$ ${Number(value).toLocaleString('pt-BR')}`, name];
                      return [`${Number(value).toLocaleString('pt-BR')} kWh`, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  
                  <Bar yAxisId="right" dataKey="kwh" name="Consumo (kWh)" fill="#fef3c7" radius={[4, 4, 0, 0]} />
                  <Area yAxisId="left" type="monotone" dataKey="valor" name="Custo (R$)" fill="#d1fae5" stroke="#10b981" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex justify-center items-center text-slate-400">Sem dados para os filtros selecionados</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-semibold text-slate-800 mb-2">Impacto por Bandeira (R$)</h3>
          <p className="text-xs text-slate-500 mb-6">Proporção do valor total gasto no período</p>
          
          {flagPieData.length > 0 ? (
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={flagPieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {flagPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={FLAG_COLORS[entry.originalFlag] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value) || 0)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center text-slate-400">Sem dados</div>
          )}
        </div>
      </div>
      
      {/* CHARTS ROW 2 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-6">Variação do Custo do kWh (R$)</h3>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `R$ ${val}`} axisLine={false} tickLine={false} />
                
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any) => [`R$ ${Number(value).toLocaleString('pt-BR', {minimumFractionDigits: 4})}`, name]}
                />
                
                <Line type="stepAfter" dataKey="custoUnitario" name="Custo do kWh (R$)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex justify-center items-center text-slate-400">Sem dados para os filtros selecionados</div>
        )}
      </div>

    </div>
  );
}
