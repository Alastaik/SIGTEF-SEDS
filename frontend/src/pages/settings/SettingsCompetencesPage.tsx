import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Competence {
  id: string;
  month: number;
  year: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  FUTURA: 'bg-slate-100 text-slate-700',
  ABERTA_LANCAMENTO: 'bg-blue-100 text-blue-700',
  ABERTA_PRESTACAO: 'bg-indigo-100 text-indigo-700',
  EM_ANALISE: 'bg-yellow-100 text-yellow-700',
  FECHADA: 'bg-red-100 text-red-700',
  BLOQUEADA: 'bg-slate-800 text-white',
};

const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function SettingsCompetencesPage() {
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [loading, setLoading] = useState(true);

  // States para novo form
  const [newMonth, setNewMonth] = useState(new Date().getMonth() + 1);
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [creating, setCreating] = useState(false);

  // States para reabertura
  const [reopenId, setReopenId] = useState<string | null>(null);
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);

  useEffect(() => {
    fetchCompetences();
  }, []);

  const fetchCompetences = async () => {
    try {
      const response = await api.get('/competences');
      setCompetences(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await api.post('/competences', { month: newMonth, year: newYear });
      await fetchCompetences();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar competência');
    } finally {
      setCreating(false);
    }
  };

  const handleChangeStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/competences/${id}/status`, { status: newStatus });
      await fetchCompetences();
    } catch (error: any) {
      alert('Erro ao alterar status');
    }
  };

  const handleReopen = async () => {
    if (!reopenId || !reopenReason.trim()) return;
    setReopening(true);
    try {
      await api.post(`/competences/${reopenId}/reopen`, { reason: reopenReason });
      setReopenId(null);
      setReopenReason('');
      await fetchCompetences();
    } catch (error) {
      alert('Erro ao reabrir competência');
    } finally {
      setReopening(false);
    }
  };

  if (loading) return <div className="p-4 text-slate-500">Carregando...</div>;

  return (
    <div className="space-y-8">
      {/* Criar Nova */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mês</label>
          <select value={newMonth} onChange={e => setNewMonth(Number(e.target.value))} className="rounded-md border border-slate-300 px-3 py-2 w-32">
            {monthNames.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ano</label>
          <input type="number" value={newYear} onChange={e => setNewYear(Number(e.target.value))} className="rounded-md border border-slate-300 px-3 py-2 w-32" />
        </div>
        <button 
          onClick={handleCreate} disabled={creating}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
        >
          {creating ? 'Criando...' : 'Criar Competência'}
        </button>
      </div>

      {/* Lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competences.map(comp => (
          <div key={comp.id} className="border border-slate-200 rounded-lg p-5 shadow-sm relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold text-slate-800">{monthNames[comp.month - 1]}/{comp.year}</h4>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-2 ${statusColors[comp.status] || statusColors['FUTURA']}`}>
                  {comp.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
              <label className="text-xs text-slate-500 font-semibold uppercase">Alterar Status</label>
              <select 
                value={comp.status} 
                onChange={(e) => handleChangeStatus(comp.id, e.target.value)}
                className="w-full text-sm rounded border border-slate-300 px-2 py-1"
                disabled={comp.status === 'FECHADA'} // Se fechada, só pode reabrir via auditoria
              >
                <option value="FUTURA">FUTURA</option>
                <option value="ABERTA_LANCAMENTO">ABERTA PARA LANÇAMENTO</option>
                <option value="ABERTA_PRESTACAO">ABERTA PARA PRESTAÇÃO</option>
                <option value="EM_ANALISE">EM ANÁLISE</option>
                <option value="FECHADA">FECHADA</option>
                <option value="BLOQUEADA">BLOQUEADA</option>
              </select>

              {comp.status === 'FECHADA' && (
                <button 
                  onClick={() => setReopenId(comp.id)}
                  className="w-full mt-2 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  Reabrir (Requer Justificativa)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Reabertura */}
      {reopenId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Reabrir Competência</h3>
            <p className="text-sm text-slate-500 mb-4">Esta ação ficará registrada na trilha de auditoria. Informe o motivo técnico ou legal para reabrir uma competência que já estava fechada.</p>
            <textarea
              className="w-full rounded-md border border-slate-300 p-3 h-24 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Descreva o motivo detalhadamente..."
              value={reopenReason}
              onChange={e => setReopenReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-3">
              <button onClick={() => setReopenId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancelar</button>
              <button onClick={handleReopen} disabled={reopening || !reopenReason.trim()} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50">
                {reopening ? 'Reabrindo...' : 'Confirmar Reabertura'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
