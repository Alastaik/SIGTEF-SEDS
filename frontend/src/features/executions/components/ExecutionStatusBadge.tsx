import { CheckCircle, Clock, AlertTriangle, Lock, X, RefreshCw } from 'lucide-react';

export const getExecutionStatusLabel = (status: string): string => {
  switch (status) {
    case 'WAITING_TRANSFER': return 'Aguardando Repasse';
    case 'READY_FOR_ACCOUNTABILITY': return 'Aguardando Prestação';
    case 'ACCOUNTABILITY_DRAFT': return 'Rascunho';
    case 'SUBMITTED': return 'Prestação Enviada';
    case 'RESUBMITTED': return 'Prestação Reenviada';
    case 'UNDER_REVIEW': return 'Em Análise SEDS';
    case 'PENDING_CORRECTION': return 'Pendente de Correção';
    case 'APPROVED': return 'Prestação Aprovada';
    case 'REJECTED': return 'Prestação Reprovada';
    case 'CLOSED': return 'Fechado';
    case 'BLOCKED': return 'Bloqueado';
    case 'CANCELED': return 'Cancelado';
    case 'ACCOUNTABILITY_CLOSED_UNREALIZED': return 'Fechada s/ Realização';
    default: return status;
  }
};

export function ExecutionStatusBadge({ status }: { status: string }) {
  const label = getExecutionStatusLabel(status);
  
  switch (status) {
    case 'WAITING_TRANSFER': 
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-max"><Clock size={12}/> {label}</span>;
    case 'READY_FOR_ACCOUNTABILITY': 
      return <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> {label}</span>;
    case 'ACCOUNTABILITY_DRAFT': 
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-max"><Clock size={12}/> {label}</span>;
    case 'SUBMITTED': 
      return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> {label}</span>;
    case 'RESUBMITTED': 
      return <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-max"><RefreshCw size={12}/> {label}</span>;
    case 'UNDER_REVIEW': 
      return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-max"><Clock size={12}/> {label}</span>;
    case 'PENDING_CORRECTION': 
      return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-max"><AlertTriangle size={12}/> {label}</span>;
    case 'APPROVED': 
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> {label}</span>;
    case 'REJECTED': 
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-max"><AlertTriangle size={12}/> {label}</span>;
    case 'CLOSED': 
      return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-max"><Lock size={12}/> {label}</span>;
    case 'ACCOUNTABILITY_CLOSED_UNREALIZED': 
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-max"><Lock size={12}/> {label}</span>;
    case 'BLOCKED': 
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-max"><Lock size={12}/> {label}</span>;
    case 'CANCELED': 
      return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-max"><X size={12}/> {label}</span>;
    default: 
      return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium w-max">{label}</span>;
  }
}
