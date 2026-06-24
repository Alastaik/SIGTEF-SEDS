import { Outlet, Link, useNavigate } from 'react-router';
import { useAuth } from '../features/auth/AuthContext';
import { RequirePermission } from '../features/auth/RequirePermission';
import { Users, Shield, LogOut, LayoutDashboard, Settings } from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 md:p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white tracking-tight">SIGTEF</h1>
          <p className="text-sm text-slate-400 mt-1">Gestão de Fomentos</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <RequirePermission permission="usuarios:visualizar">
            <Link to="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <Users size={20} />
              Usuários
            </Link>
          </RequirePermission>

          <RequirePermission permission="ROLE_ADMIN">
            <Link to="/admin/roles" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <Shield size={20} />
              Perfis de Acesso
            </Link>
          </RequirePermission>

          <RequirePermission permission="SETTINGS_VIEW">
            <Link to="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <Settings size={20} />
              Configurações
            </Link>
          </RequirePermission>

          <RequirePermission permission="ROLE_ADMIN">
            <Link to="/admin/base-registries" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <LayoutDashboard size={20} />
              Cadastros Base
            </Link>
          </RequirePermission>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="mb-4 px-3">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-500/10 text-slate-300 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 lg:px-8 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-slate-800">Painel Administrativo</h2>
        </header>
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
