import React from 'react';
import type { EnergyDashboard } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Props {
  dashboard: EnergyDashboard;
}

export function EnergyConsumptionChart({ dashboard }: Props) {
  const data = dashboard.records.slice().reverse().map(record => ({
    name: record.competenceDisplay,
    kwh: record.kwhAmount,
    valor: record.totalValue
  }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        Sem dados para exibir
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={10} />
          <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `R$ ${val}`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val} kWh`} />
          <Tooltip 
            formatter={(value: any, name: any) => {
              if (name === 'Valor (R$)') return [`R$ ${Number(value).toLocaleString('pt-BR')}`, name];
              return [`${Number(value).toLocaleString('pt-BR')} kWh`, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line yAxisId="left" type="monotone" dataKey="valor" name="Valor (R$)" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} />
          <Line yAxisId="right" type="monotone" dataKey="kwh" name="Consumo (kWh)" stroke="#f59e0b" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
