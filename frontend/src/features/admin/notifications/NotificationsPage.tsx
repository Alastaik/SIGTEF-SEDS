import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Bell, CheckCheck, Eye, Clock, AlertCircle, Info, CheckCircle } from 'lucide-react';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  channel: string;
  status: string;
  readAt: string | null;
  createdAt: string;
};

const typeConfig: Record<string, { icon: any; bg: string; text: string; border: string }> = {
  INFO: {
    icon: Info,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  WARNING: {
    icon: AlertCircle,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  ERROR: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  SUCCESS: {
    icon: CheckCircle,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchNotifications = async (p = 0, f = filter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p.toString(), size: '15' });
      if (f === 'UNREAD') params.append('onlyUnread', 'true');
      if (f === 'READ') params.append('onlyRead', 'true');

      const res = await api.get(`/notifications/my?${params.toString()}`);
      setNotifications(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(0, filter);
  }, [filter]);

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
      );
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="text-blue-600" size={26} />
            Notificações
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {totalElements} notificação(ões) · {unreadCount} não lida(s) nesta página
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm hover:bg-blue-100 transition-colors"
          >
            <CheckCheck size={16} />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filtros de Tab */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { key: 'ALL', label: 'Todas' },
          { key: 'UNREAD', label: 'Não lidas' },
          { key: 'READ', label: 'Lidas' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Bell size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Nenhuma notificação encontrada.</p>
          </div>
        ) : (
          notifications.map(notif => {
            const config = typeConfig[notif.type] || typeConfig.INFO;
            const Icon = config.icon;
            const isUnread = !notif.readAt;

            return (
              <div
                key={notif.id}
                className={`flex gap-4 p-4 rounded-xl border transition-all ${
                  isUnread
                    ? `${config.bg} ${config.border} shadow-sm`
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className={`mt-0.5 p-2 rounded-full ${config.bg} ${config.border} border shrink-0`}>
                  <Icon size={18} className={config.text} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${isUnread ? 'text-slate-900' : 'text-slate-600'}`}>
                      {notif.title}
                      {isUnread && (
                        <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full align-middle" />
                      )}
                    </p>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 capitalize">{notif.channel?.toLowerCase()}</span>
                      {notif.readAt && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Eye size={11} />
                          Lida em {formatDate(notif.readAt)}
                        </span>
                      )}
                    </div>
                    {isUnread && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck size={12} />
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm text-slate-500">Página {page + 1} de {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => fetchNotifications(page - 1)}
              className="px-3 py-1 border border-slate-300 rounded text-sm bg-white disabled:opacity-50 hover:bg-slate-50"
            >
              Anterior
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => fetchNotifications(page + 1)}
              className="px-3 py-1 border border-slate-300 rounded text-sm bg-white disabled:opacity-50 hover:bg-slate-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
