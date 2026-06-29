import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Bell, Check, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  link: string;
  createdAt: string;
}

interface PageData {
  content: Notification[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export function PortalNotifications() {
  const [data, setData] = useState<PageData>({ content: [], totalPages: 0, totalElements: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);

  const fetchNotifications = async (pageNumber = 0, unread = unreadOnly) => {
    try {
      setLoading(true);
      const res = await api.get(`/notifications?page=${pageNumber}&size=10&unreadOnly=${unread}`);
      setData(res.data);
    } catch (error) {
      console.error('Erro ao carregar notificações', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page, unreadOnly);
  }, [page, unreadOnly]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      // Update local state
      setData(prev => ({
        ...prev,
        content: prev.content.map(n => n.id === id ? { ...n, read: true } : n)
      }));
    } catch (error) {
      console.error('Erro ao marcar como lida', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setData(prev => ({
        ...prev,
        content: prev.content.map(n => ({ ...n, read: true }))
      }));
    } catch (error) {
      console.error('Erro ao marcar todas como lidas', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Central de Notificações</h1>
          <p className="text-gray-500">Acompanhe os avisos e atualizações do sistema</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => { setPage(0); setUnreadOnly(!unreadOnly); }}
            className={`px-4 py-2 text-sm font-medium rounded-md border ${
              unreadOnly ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Apenas não lidas
          </button>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Marcar todas como lidas
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-200">
        {loading && data.content.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : data.content.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Bell size={48} className="text-gray-300 mb-4" />
            <p className="text-lg">Você não tem novas notificações.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.content.map(notification => (
              <div
                key={notification.id}
                className={`p-6 transition-colors ${
                  !notification.read ? 'bg-blue-50/50 hover:bg-blue-50' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-full mt-1 ${
                      !notification.read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Bell size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-base font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Nova</span>
                        )}
                      </div>
                      <p className={`text-sm mb-3 ${!notification.read ? 'text-gray-800' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {format(new Date(notification.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        
                        {notification.link && (
                          <Link
                            to={notification.link}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <ExternalLink size={14} />
                            Ver detalhes
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Marcar como lida"
                    >
                      <Check size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Página <span className="font-medium">{data.number + 1}</span> de <span className="font-medium">{data.totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={data.number === 0}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                disabled={data.number >= data.totalPages - 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
