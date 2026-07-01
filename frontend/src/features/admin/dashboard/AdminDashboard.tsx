import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { 
  Building2, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Wallet,
  Lock
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

interface DashboardStats {
  totalActiveEntities: number;
  totalActiveAgreements: number;
  agreementsExpiringSoon: number;
  pendingAccountabilities: number;
  accountabilitiesInAnalysis: number;
  accountabilitiesApprovedThisMonth: number;
  openIssues: number;
  overdueIssues: number;
  entitiesWithOneOverdue: number;
  entitiesWithTwoOverdue: number;
  entitiesSuspended: number;
  totalTransferredThisMonth: number;
  totalApprovedThisMonth: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/general');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="p-8 text-center text-slate-500 flex justify-center items-center h-full">Carregando painel gerencial...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
          <p className="text-slate-500 mt-1">Acompanhamento geral do SIGTEF</p>
        </div>
        <div className="flex gap-2">
          <select className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white">
            <option>Mês Atual</option>
            <option>Mês Anterior</option>
            <option>Este Ano</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Entidades Ativas */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 size={24} />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+2 este mês</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Entidades Ativas</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalActiveEntities}</p>
          </div>
        </div>

        {/* Termos Ativos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText size={24} />
            </div>
            {stats.agreementsExpiringSoon > 0 && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{stats.agreementsExpiringSoon} vencendo</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Termos Vigentes</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalActiveAgreements}</p>
          </div>
        </div>

        {/* Prestações Pendentes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Prestações Não Enviadas</p>
            <p className="text-2xl font-bold text-slate-800">{stats.pendingAccountabilities}</p>
          </div>
        </div>

        {/* Prestações em Análise */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Prestações em Análise</p>
            <p className="text-2xl font-bold text-slate-800">{stats.accountabilitiesInAnalysis}</p>
          </div>
        </div>

        {/* Prestações Aprovadas */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Aprovadas no Mês</p>
            <p className="text-2xl font-bold text-slate-800">{stats.accountabilitiesApprovedThisMonth}</p>
          </div>
        </div>

        {/* Pendências */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            {stats.overdueIssues > 0 && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">{stats.overdueIssues} vencidas</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pendências Abertas</p>
            <p className="text-2xl font-bold text-slate-800">{stats.openIssues}</p>
          </div>
        </div>

        {/* Inadimplência: 1 Atraso */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Entidades com 1 Atraso</p>
            <p className="text-2xl font-bold text-slate-800">{stats.entitiesWithOneOverdue}</p>
          </div>
        </div>

        {/* Inadimplência: 2 Atrasos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Entidades com 2 Atrasos</p>
            <p className="text-2xl font-bold text-slate-800">{stats.entitiesWithTwoOverdue}</p>
          </div>
        </div>

        {/* Inadimplência: Suspensas (3+ Atrasos) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <Lock size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Entidades Suspensas (3+)</p>
            <p className="text-2xl font-bold text-slate-800">{stats.entitiesSuspended}</p>
          </div>
        </div>

        {/* Valores */}
        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 col-span-1 md:col-span-2 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-800 text-emerald-400 rounded-lg">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-medium text-slate-400">Totalizadores do Mês</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-sm font-medium text-slate-400">Repassado</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalTransferredThisMonth)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Aprovado</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.totalApprovedThisMonth)}</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
