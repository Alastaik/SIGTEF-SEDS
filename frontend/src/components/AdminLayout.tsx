import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../features/auth/AuthContext';
import { RequirePermission } from '../features/auth/RequirePermission';
import {
  Users, Shield, LogOut, LayoutDashboard, Settings,
  Building2, FileText, CalendarDays, Bell, BarChart2,
  FileCheck, CheckSquare, FileUp
} from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = (href: string) => {
    const isActive = location.pathname === href || (href !== '/admin' && location.pathname.startsWith(href));
    return `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
      isActive
        ? 'bg-blue-600 text-white font-medium'
        : 'hover:bg-slate-800 text-slate-300 hover:text-white'
    }`;
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-slate-900 text-white flex flex-col h-full">
        <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col items-center justify-center shrink-0">
          <img
            src="https://goias.gov.br/social/wp-content/uploads/sites/24/2019/07/logo_seds_-_aplicacao_brasao_b-510-768x434.png"
            alt="SEDS Logo"
            className="w-32 mb-4 object-contain brightness-0 invert"
          />
          <h1 className="text-xl font-bold text-white tracking-tight">SIGTEF</h1>
          <p className="text-sm text-slate-400 mt-1 text-center">Gestão de Fomentos</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Operação</div>
          <Link to="/admin" className={linkClass('/admin')}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <RequirePermission permission="entidades:visualizar">
            <Link to="/admin/entities" className={linkClass('/admin/entities')}>
              <Building2 size={18} />
              Entidades
            </Link>
          </RequirePermission>

          <RequirePermission permission="agreements:view">
            <Link to="/admin/agreements" className={linkClass('/admin/agreements')}>
              <FileText size={18} />
              Termos de Fomento
            </Link>
          </RequirePermission>

          <RequirePermission permission="notifications:view">
            <Link to="/admin/notifications" className={linkClass('/admin/notifications')}>
              <Bell size={18} />
              Notificações
            </Link>
          </RequirePermission>

          <div className="mt-6 mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Acompanhamento</div>
          
          <RequirePermission permission="ROLE_GESTOR">
            <Link to="/admin/executions" className={linkClass('/admin/executions')}>
              <CalendarDays size={18} />
              Lançamentos Mensais
            </Link>
          </RequirePermission>

          <RequirePermission permission="ROLE_SEDS">
            <Link to="/admin/analysis" className={linkClass('/admin/analysis')}>
              <FileCheck size={18} />
              Análise de Prestações
            </Link>
          </RequirePermission>

          <RequirePermission permission="ROLE_SEDS">
            <Link to="/admin/inspections" className={linkClass('/admin/inspections')}>
              <CheckSquare size={18} />
              Fiscalização
            </Link>
          </RequirePermission>

          <RequirePermission permission="reports:view">
            <Link to="/admin/reports" className={linkClass('/admin/reports')}>
              <BarChart2 size={18} />
              Relatórios
            </Link>
          </RequirePermission>

          <div className="mt-6 mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Administração</div>
          
          <RequirePermission permission="ROLE_ADMIN">
            <Link to="/admin/base-registries" className={linkClass('/admin/base-registries')}>
              <LayoutDashboard size={18} />
              Cadastros Base
            </Link>
          </RequirePermission>

          <RequirePermission permission="ROLE_ADMIN">
            <Link to="/admin/imports" className={linkClass('/admin/imports')}>
              <FileUp size={18} />
              Importações
            </Link>
          </RequirePermission>

          <RequirePermission permission="usuarios:visualizar">
            <Link to="/admin/users" className={linkClass('/admin/users')}>
              <Users size={18} />
              Usuários
            </Link>
          </RequirePermission>

          <RequirePermission permission="ROLE_ADMIN">
            <Link to="/admin/roles" className={linkClass('/admin/roles')}>
              <Shield size={18} />
              Perfis de Acesso
            </Link>
          </RequirePermission>

          <RequirePermission permission="SETTINGS_VIEW">
            <Link to="/admin/settings" className={linkClass('/admin/settings')}>
              <Settings size={18} />
              Configurações
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
