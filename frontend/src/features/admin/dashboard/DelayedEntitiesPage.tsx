import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { AlertTriangle, ChevronDown, ChevronRight, Building2, Calendar, CheckCircle } from 'lucide-react';

interface DelayedAccountability {
  accountabilityId: string;
  month: number;
  year: number;
  programName: string;
  status: string;
}

interface DelayedEntity {
  entityId: string;
  entityName: string;
  cnpj: string;
  totalDelayedMonths: number;
  delayedAccountabilities: DelayedAccountability[];
}

export function DelayedEntitiesPage() {
  const [entities, setEntities] = useState<DelayedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchDelayedEntities();
  }, []);

  const fetchDelayedEntities = async () => {
    try {
      const response = await api.get('/admin/dashboard/delayed-entities');
      setEntities(response.data);
    } catch (error) {
      console.error('Erro ao buscar entidades atrasadas', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CLOSED_UNREALIZED': return 'Fechada sem Realização';
      case 'PENDING': return 'Pendente';
      default: return status;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Carregando dados...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <AlertTriangle className="text-red-500" /> Entidades Inadimplentes
        </h2>
        <p className="text-slate-500 mt-1">Lista de entidades com prestações de contas atrasadas ou não realizadas.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {entities.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
            Nenhuma entidade com prestação atrasada no momento.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {entities.map((entity) => (
              <div key={entity.entityId} className="group">
                {/* Cabeçalho da Linha (Clicável) */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleRow(entity.entityId)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-slate-400">
                      {expandedId === entity.entityId ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-2">
                        <Building2 size={16} className="text-slate-400" />
                        {entity.entityName}
                      </div>
                      <div className="text-sm text-slate-500">{entity.cnpj}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      entity.totalDelayedMonths >= 3 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {entity.totalDelayedMonths} {entity.totalDelayedMonths === 1 ? 'mês atrasado' : 'meses atrasados'}
                    </span>
                    {entity.totalDelayedMonths >= 3 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white shadow-sm">
                        SUJEITO A SUSPENSÃO
                      </span>
                    )}
                  </div>
                </div>

                {/* Conteúdo Expandido */}
                {expandedId === entity.entityId && (
                  <div className="bg-slate-50 p-4 pl-12 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Calendar size={16} /> Detalhamento das Competências Atrasadas
                    </h4>
                    <div className="space-y-2">
                      {entity.delayedAccountabilities.map(acc => (
                        <div key={acc.accountabilityId} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                          <div>
                            <span className="font-medium text-slate-800">
                              Mês {String(acc.month).padStart(2, '0')}/{acc.year}
                            </span>
                            <span className="text-sm text-slate-500 ml-3">
                              {acc.programName}
                            </span>
                          </div>
                          <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md border border-red-100 font-medium">
                            {getStatusLabel(acc.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
