import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { LogOut, Home, FileText, CheckSquare, Bell, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentEntity, setCurrentEntity] = useState<any>(null);

  useEffect(() => {
    // Carregar entidade selecionada
    const entityId = localStorage.getItem('currentEntityId');
    const entityName = localStorage.getItem('currentEntityName');
    if (!entityId && location.pathname !== '/portal/select-entity') {
      navigate('/portal/select-entity');
    } else if (entityId) {
      setCurrentEntity({ id: entityId, name: entityName });
    }
  }, [location.pathname, navigate]);

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
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-800">SIGTEF</span>
                <span className="ml-2 text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Portal da Entidade</span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-4 overflow-x-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                        isActive 
                          ? 'border-blue-500 text-gray-900' 
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon size={16} className="mr-2 shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {currentEntity && (
                <div className="hidden lg:flex flex-col items-end mr-4">
                  <span className="text-xs text-gray-500 whitespace-nowrap">Atuando como:</span>
                  <span className="text-sm font-semibold text-gray-900 truncate max-w-[200px]" title={currentEntity.name}>{currentEntity.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                  <span className="text-xs text-gray-500">{user?.email}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  <User size={16} />
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-gray-100"
                  title="Sair do sistema"
                >
                  <LogOut size={20} />
                </button>
              </div>
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
