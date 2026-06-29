import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { FileUp, List, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ImportWizard } from './components/ImportWizard';

interface ImportBatch {
  id: string;
  importType: string;
  mode: string;
  status: string;
  originalFileName: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  appliedRows: number;
  createdAt: string;
}

export function ImportsPage() {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/imports');
      setBatches(response.data);
    } catch (error) {
      console.error('Erro ao carregar lotes de importação:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPLOADED':
      case 'PARSING':
      case 'VALIDATING':
        return 'bg-blue-100 text-blue-800';
      case 'READY_TO_APPLY':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPLIED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'FAILED':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileUp className="text-blue-600" size={26} />
            Importação e Migração de Dados
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Faça upload de planilhas de dados legados com validação automática.
          </p>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          Nova Importação
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-2">
          <List size={18} className="text-slate-500" />
          <h2 className="font-semibold text-slate-800">Histórico de Lotes</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando lotes...</div>
        ) : batches.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Nenhum lote de importação encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Arquivo / Tipo</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Modo</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Progresso</th>
                  <th className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{batch.originalFileName}</p>
                      <p className="text-xs text-slate-500">{batch.importType}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(batch.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {batch.mode}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                        {getStatusIcon(batch.status)}
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Linhas Válidas:</span>
                          <span className="font-medium text-green-600">{batch.validRows}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Com Erro:</span>
                          <span className="font-medium text-red-600">{batch.errorRows}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${batch.totalRows > 0 ? (batch.validRows / batch.totalRows) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showWizard && (
        <ImportWizard 
          onClose={() => setShowWizard(false)} 
          onSuccess={() => {
            setShowWizard(false);
            fetchBatches();
          }} 
        />
      )}
    </div>
  );
}
