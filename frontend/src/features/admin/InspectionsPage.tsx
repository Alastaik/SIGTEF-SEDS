import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { CheckSquare, Search, Plus, Filter, AlertTriangle } from 'lucide-react';

export function InspectionsPage() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Como a API de Inspections ainda será construída, vamos mockar os dados 
    // ou apenas exibir o layout, e usar o toast para notificar
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CheckSquare className="text-blue-600" size={26} />
            Fiscalização e Vistorias
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Controle de vistorias, checklists e irregularidades das Organizações da Sociedade Civil.
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus size={20} />
          Nova Vistoria
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Buscar por entidade, número de termo ou inspetor..."
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
          <Filter size={18} />
          Filtros Avançados
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Entidade (OSC)</th>
                <th className="px-4 py-3">Termo de Fomento</th>
                <th className="px-4 py-3">Inspetor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Irregularidades</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-500">Carregando vistorias...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <AlertTriangle size={32} className="text-slate-400" />
                      <p>Módulo de Fiscalização em construção.</p>
                      <p className="text-sm">As APIs de backend estão sendo preparadas.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
