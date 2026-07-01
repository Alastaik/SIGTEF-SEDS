import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { LogOut, Home, FileText, CheckSquare, Bell, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentEntity, setCurrentEntity] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Carregar entidade selecionada
    const entityId = localStorage.getItem('currentEntityId');
    const entityName = localStorage.getItem('currentEntityName');
    if (!entityId && location.pathname !== '/portal/select-entity') {
      navigate('/portal/select-entity');
    } else if (entityId) {
      setCurrentEntity({ id: entityId, name: entityName });
    }

    // Fetch unread count
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.count);
      } catch (error) {
        console.error('Erro ao buscar notificações', error);
      }
    };
    
    if (user) {
      fetchUnreadCount();
      // Polling could be added here if needed, but for now just on load/navigate
    }
  }, [location.pathname, navigate, user]);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('currentEntityId');
    localStorage.removeItem('currentEntityName');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/portal', icon: Home },
    { name: 'Meus Termos', path: '/portal/agreements', icon: FileText },
    { name: 'Competências', path: '/portal/competences', icon: CheckSquare },
    { name: 'Prestações', path: '/portal/accountabilities', icon: FileText },
    { name: 'Pendências', path: '/portal/issues', icon: Bell },
  ];

  if (location.pathname === '/portal/select-entity') {
    return <Outlet />;
  }

  const entityId = localStorage.getItem('currentEntityId');
  if (!entityId) {
    // Redirecionamento será feito pelo useEffect, não renderiza nada ainda
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header (Top Navigation) */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        {/* Top Row: Brand & User Info */}
        <div className="border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-blue-800 tracking-tight">SIGTEF</span>
                <span className="ml-3 text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-full border border-blue-100 hidden sm:inline-block">Portal da Entidade</span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                {currentEntity && (
                  <div className="hidden md:flex flex-col items-end mr-2 sm:mr-4">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Atuando como</span>
                    <span className="text-sm font-semibold text-slate-800 truncate max-w-[150px] lg:max-w-[250px]" title={currentEntity.name}>{currentEntity.name}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 sm:gap-3 border-l pl-2 sm:pl-4 border-slate-200">
                  <Link
                    to="/portal/notifications"
                    className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-full hover:bg-slate-100"
                    title="Notificações"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </Link>

                  <div className="hidden sm:flex flex-col items-end ml-2">
                    <span className="text-sm font-medium text-slate-900">{user?.name}</span>
                    <span className="text-xs text-slate-500">{user?.email}</span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <User size={16} />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-2 p-2 text-slate-400 hover:text-red-600 transition-colors rounded-full hover:bg-slate-100"
                    title="Sair do sistema"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Navigation */}
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={16} className={`mr-2 shrink-0 ${isActive ? 'text-blue-100' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
