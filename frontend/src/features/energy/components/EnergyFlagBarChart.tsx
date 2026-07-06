import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Props {
  flagDistribution: Record<string, number>;
}

const getFlagColor = (flagName: string) => {
  switch (flagName) {
    case 'VERDE': return '#22c55e';
    case 'AMARELA': return '#eab308';
    case 'VERMELHA_PATAMAR_1': return '#f97316';
    case 'VERMELHA_PATAMAR_2': return '#ef4444';
    case 'ESCASSEZ_HIDRICA': return '#a855f7';
    default: return '#94a3b8';
  }
};

const getFlagLabel = (flagName: string) => {
  switch (flagName) {
    case 'VERDE': return 'Verde';
    case 'AMARELA': return 'Amarela';
    case 'VERMELHA_PATAMAR_1': return 'Verm. 1';
    case 'VERMELHA_PATAMAR_2': return 'Verm. 2';
    case 'ESCASSEZ_HIDRICA': return 'Escassez';
    default: return flagName;
  }
};

export function EnergyFlagBarChart({ flagDistribution }: Props) {
  const data = Object.entries(flagDistribution).map(([flag, count]) => ({
    name: getFlagLabel(flag),
    originalName: flag,
    count
  })).sort((a, b) => b.count - a.count);

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
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={10} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            formatter={(value: any) => [value, 'Meses']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getFlagColor(entry.originalName)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
