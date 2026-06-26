import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import { ArrowLeft, CheckCircle, Clock, FileText, AlertTriangle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: string;
  actor: string;
}

export function PortalAccountabilityDetails() {
  const { id } = useParams();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await api.get(`/portal/accountabilities/${id}/timeline`);
        setEvents(response.data);
      } catch (error) {
        console.error('Erro ao carregar linha do tempo', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [id]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'INICIADA':
      case 'ENVIADA':
        return <Send size={16} className="text-blue-600" />;
      case 'ANALISE':
        return <Clock size={16} className="text-purple-600" />;
      case 'PENDENCIA':
        return <AlertTriangle size={16} className="text-orange-600" />;
      case 'RESPOSTA':
        return <FileText size={16} className="text-blue-600" />;
      case 'PENDENCIA_RESOLVIDA':
      case 'APROVADA':
        return <CheckCircle size={16} className="text-emerald-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'INICIADA':
      case 'ENVIADA':
      case 'RESPOSTA':
        return 'bg-blue-100 border-blue-200';
      case 'ANALISE':
        return 'bg-purple-100 border-purple-200';
      case 'PENDENCIA':
        return 'bg-orange-100 border-orange-200';
      case 'PENDENCIA_RESOLVIDA':
      case 'APROVADA':
        return 'bg-emerald-100 border-emerald-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando detalhes...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link to="/portal/accountabilities" className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Acompanhamento da Prestação</h1>
          <p className="text-sm text-gray-500">Histórico de tramitação</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-8 border-b pb-4">Linha do Tempo</h2>
        
        {events.length === 0 ? (
          <p className="text-gray-500 text-center">Nenhum evento registrado.</p>
        ) : (
          <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pb-4">
            {events.map((event) => (
              <div key={event.id} className="relative pl-8">
                {/* Connector line dot */}
                <div className={`absolute -left-[17px] top-1 h-8 w-8 rounded-full border-2 border-white flex items-center justify-center ${getColor(event.type)}`}>
                  {getIcon(event.type)}
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{event.title}</h3>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {format(new Date(event.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  
                  {event.description && (
                    <p className="text-gray-600 text-sm mt-2 bg-gray-50 p-3 rounded border border-gray-100">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="mt-3 text-xs text-gray-500 font-medium">
                    Ator responsável: <span className="text-gray-700">{event.actor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
