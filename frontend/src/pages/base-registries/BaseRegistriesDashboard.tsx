import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { MapPin, FileText, AlertCircle, Building2 } from 'lucide-react';

export function BaseRegistriesDashboard() {
  const [stats, setStats] = useState({
    cities: 0,
    programs: 0,
    documents: 0,
    issues: 0,
    concessionaires: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca dados em paralelo para montar o painel
    const fetchStats = async () => {
      try {
        const [citiesReq, programsReq, docsReq, concReq] = await Promise.all([
          api.get('/cities'),
          api.get('/programs'),
          api.get('/document-types'),
          api.get('/domain-data/type/CONCESSIONARIA')
        ]);

        setStats({
          cities: citiesReq.data.filter((c: any) => c.active).length,
          programs: programsReq.data.filter((c: any) => c.active).length,
          documents: docsReq.data.filter((c: any) => c.active).length,
          issues: 0,
          concessionaires: concReq.data.filter((c: any) => c.active).length
        });
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-6">Carregando painel...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Visão Geral dos Cadastros</h1>
      
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Municípios Ativos</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.cities}</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Programas Ativos</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Building2 size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.programs}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Tipos Documento</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FileText size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.documents}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Tipos de Pendência</h3>
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><AlertCircle size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.issues}</p>
        </div>
      </div>

      {/* Painel de Alertas Dinâmico */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-yellow-800 font-bold mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          Alertas do Sistema
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-yellow-700 text-sm">
          {stats.programs === 0 && <li>Não existem programas cadastrados no sistema. A criação de fomentos estará bloqueada.</li>}
          {stats.documents === 0 && <li>Não existem Tipos de Documento cadastrados. O upload de documentos não funcionará corretamente.</li>}
          <li>Os relatórios indicam que alguns municípios estão sem região vinculada. Por favor, verifique.</li>
        </ul>
      </div>
    </div>
  );
}
