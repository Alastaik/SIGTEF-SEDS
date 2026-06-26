import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function PortalDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/portal/dashboard');
        setDashboard(response.data);
      } catch (error) {
        console.error('Erro ao buscar dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando painel...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Visão Geral</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Prestações Pendentes</h3>
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><AlertTriangle size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.pendingAccountabilities || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Em Análise</h3>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Clock size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.inAnalysisAccountabilities || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Aprovadas</h3>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.approvedAccountabilities || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Termos Ativos</h3>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><FileText size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.activeAgreements || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-4">
          <Link 
            to="/portal/competences"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
          >
            Nova Prestação de Contas
          </Link>
          <Link 
            to="/portal/agreements"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-block"
          >
            Ver meus Termos
          </Link>
        </div>
      </div>
    </div>
  );
}
