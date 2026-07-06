import React from 'react';
import type { TariffFlag } from '../types';
import { AlertTriangle, Info, Zap, XOctagon } from 'lucide-react';

interface Props {
  flag: TariffFlag | string;
}

export function TariffFlagBadge({ flag }: Props) {
  const getFlagConfig = () => {
    switch (flag) {
      case 'VERDE':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: <Zap className="w-4 h-4 mr-1" />, label: 'Verde' };
      case 'AMARELA':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Info className="w-4 h-4 mr-1" />, label: 'Amarela' };
      case 'VERMELHA_PATAMAR_1':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <AlertTriangle className="w-4 h-4 mr-1" />, label: 'Vermelha 1' };
      case 'VERMELHA_PATAMAR_2':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertTriangle className="w-4 h-4 mr-1" />, label: 'Vermelha 2' };
      case 'ESCASSEZ_HIDRICA':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <XOctagon className="w-4 h-4 mr-1" />, label: 'Escassez Hídrica' };
      default:
        return { color: 'bg-slate-100 text-slate-800 border-slate-200', icon: <Info className="w-4 h-4 mr-1" />, label: flag };
    }
  };

  const config = getFlagConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
}
