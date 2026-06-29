import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Shield, Clock, User, Database, Activity, HardDriveDownload } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AuditLog {
  revisionId: number;
  timestamp: string;
  username: string;
  entityName: string;
}

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/admin/audit');
        setLogs(response.data);
      } catch (error) {
        console.error('Erro ao buscar logs de auditoria:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleManualBackup = async () => {
    try {
      setBackupLoading(true);
      const response = await api.post('/admin/backup/manual');
      toast.success(response.data.message || 'Backup disparado com sucesso!');
    } catch (error) {
      toast.error('Erro ao disparar backup. Verifique os logs do servidor.');
      console.error(error);
    } finally {
      setBackupLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-blue-600" size={26} />
            Auditoria e Segurança
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro de eventos e alterações no sistema para compliance operacional.
          </p>
        </div>
        <button 
          onClick={handleManualBackup}
          disabled={backupLoading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {backupLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <HardDriveDownload size={18} />
          )}
          Gerar Backup Agora
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Eventos Recentes</p>
            <h4 className="text-2xl font-bold text-slate-800">{logs.length}</h4>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <Database size={18} />
            Histórico de Alterações de Dados
          </h2>
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-medium">
            Últimos registros globais
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Rev. ID</th>
                <th className="px-4 py-3">Data e Hora</th>
                <th className="px-4 py-3">Usuário</th>
                <th className="px-4 py-3">Entidade Afetada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-500">Carregando logs do sistema...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.revisionId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      #{log.revisionId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock size={14} className="text-slate-400" />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium text-slate-800">
                        <User size={14} className="text-slate-400" />
                        {log.username || 'Sistema'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {log.entityName}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
