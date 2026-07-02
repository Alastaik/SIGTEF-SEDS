import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { RequirePermission } from '../features/auth/RequirePermission';
import {
  Users, Shield, LogOut, LayoutDashboard, Settings,
  Building2, FileText, CalendarDays, Bell, BarChart2,
  FileCheck, CheckSquare, FileUp, ChevronLeft, ChevronRight,
  ChevronDown, AlertTriangle
} from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    operacao: true,
    acompanhamento: true,
    administracao: true
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleGroup = (group: string) => {
    if (isCollapsed) setIsCollapsed(false); // expand if clicking a group
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const linkClass = (href: string) => {
    const isActive = location.pathname === href || (href !== '/admin' && location.pathname.startsWith(href));
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
      isActive
        ? 'bg-blue-600/10 text-blue-400 font-medium'
        : 'hover:bg-slate-800 text-slate-300 hover:text-white'
    } ${isCollapsed ? 'justify-center' : ''}`;
  };

  const iconClass = (href: string) => {
    const isActive = location.pathname === href || (href !== '/admin' && location.pathname.startsWith(href));
    return `shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-400'} transition-colors`;
  };

  const SidebarGroup = ({ id, label, children }: { id: string, label: string, children: React.ReactNode }) => (
    <div className="mb-4">
      {!isCollapsed ? (
        <div 
          className="flex items-center justify-between px-3 py-2 cursor-pointer text-slate-500 hover:text-slate-300 transition-colors"
          onClick={() => toggleGroup(id)}
        >
          <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
          <ChevronDown size={14} className={`transition-transform duration-300 ${openGroups[id] ? 'rotate-180' : ''}`} />
        </div>
      ) : (
        <div className="flex justify-center py-2 mb-2">
          <div className="h-px w-8 bg-slate-700 rounded-full"></div>
        </div>
      )}
      <div className={`space-y-1 overflow-hidden transition-all duration-300 ${!isCollapsed && !openGroups[id] ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${isCollapsed ? 'w-20' : 'w-72'} shrink-0 bg-[#0f172a] text-white flex flex-col h-full transition-all duration-300 relative z-20 border-r border-slate-800 shadow-xl`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-blue-600 hover:bg-blue-500 text-white p-1 rounded-full shadow-lg border-2 border-slate-900 transition-all z-50 focus:outline-none"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Section */}
        <div className={`p-4 md:p-6 border-b border-slate-800 flex flex-col items-center justify-center shrink-0 min-h-[140px] transition-all`}>
          {!isCollapsed ? (
            <>
              <img
                src="/logo-seds.png"
                alt="SEDS Logo"
                className="w-28 mb-3 object-contain brightness-0 invert opacity-90 transition-all duration-300"
              />
              <h1 className="text-xl font-bold text-white tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">SIGTEF</h1>
              <p className="text-xs text-slate-400 mt-0.5 text-center font-medium">Gestão de Fomentos</p>
            </>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg font-bold text-xl">
              S
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          
          <Link to="/admin" className={linkClass('/admin')} title={isCollapsed ? "Dashboard" : ""}>
            <LayoutDashboard size={20} className={iconClass('/admin')} />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>

          <div className="my-4"></div>

          <SidebarGroup id="operacao" label="Operação">
            <RequirePermission permission="entidades:visualizar">
              <Link to="/admin/entities" className={linkClass('/admin/entities')} title={isCollapsed ? "Entidades" : ""}>
                <Building2 size={20} className={iconClass('/admin/entities')} />
                {!isCollapsed && <span>Entidades</span>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="agreements:view">
              <Link to="/admin/agreements" className={linkClass('/admin/agreements')} title={isCollapsed ? "Termos de Fomento" : ""}>
                <FileText size={20} className={iconClass('/admin/agreements')} />
                {!isCollapsed && <span>Termos de Fomento</span>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="notifications:view">
              <Link to="/admin/notifications" className={linkClass('/admin/notifications')} title={isCollapsed ? "Notificações" : ""}>
                <Bell size={20} className={iconClass('/admin/notifications')} />
                {!isCollapsed && <span>Notificações</span>}
              </Link>
            </RequirePermission>
          </SidebarGroup>

          <SidebarGroup id="acompanhamento" label="Acompanhamento">
            <RequirePermission permission="ROLE_GESTOR">
              <Link to="/admin/executions" className={linkClass('/admin/executions')} title={isCollapsed ? "Lançamentos Mensais" : ""}>
                <CalendarDays size={20} className={iconClass('/admin/executions')} />
                {!isCollapsed && <span>Lançamentos Mensais</span>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="ROLE_SEDS">
              <Link to="/admin/analysis" className={linkClass('/admin/analysis')} title={isCollapsed ? "Análise de Prestações" : ""}>
                <FileCheck size={20} className={iconClass('/admin/analysis')} />
                {!isCollapsed && <span>Análise de Prestações</span>}
              </Link>
            </RequirePermission>
            
            <RequirePermission permission="ROLE_SEDS">
              <Link to="/admin/atrasos" className={linkClass('/admin/atrasos')} title={isCollapsed ? "Inadimplentes" : ""}>
                <AlertTriangle size={20} className={iconClass('/admin/atrasos')} />
                {!isCollapsed && <span>Inadimplentes</span>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="ROLE_SEDS">
              <Link to="/admin/inspections" className={linkClass('/admin/inspections')} title={isCollapsed ? "Fiscalização" : ""}>
                <CheckSquare size={20} className={iconClass('/admin/inspections')} />
                {!isCollapsed && <span>Fiscalização</span>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="reports:view">
              <Link to="/admin/reports" className={linkClass('/admin/reports')} title={isCollapsed ? "Relatórios" : ""}>
                <BarChart2 size={20} className={iconClass('/admin/reports')} />
                {!isCollapsed && <span>Relatórios</span>}
              </Link>
            </RequirePermission>
          </SidebarGroup>

          <SidebarGroup id="administracao" label="Administração">
            <RequirePermission permission="ROLE_ADMIN">
              <Link to="/admin/base-registries" className={linkClass('/admin/base-registries')} title={isCollapsed ? "Cadastros Base" : ""}>
                <LayoutDashboard size={20} className={iconClass('/admin/base-registries')} />
                {!isCollapsed && <span>Cadastros Base</span>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="ROLE_ADMIN">
              <Link to="/admin/imports" className={linkClass('/admin/imports')} title={isCollapsed ? "Importações" : ""}>
                <FileUp size={20} className={iconClass('/admin/imports')} />
                {!isCollapsed && <span>Importações</span>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="usuarios:visualizar">
              <Link to="/admin/users" className={linkClass('/admin/users')} title={isCollapsed ? "Usuários" : ""}>
                <Users size={20} className={iconClass('/admin/users')} />
                {!isCollapsed && <span>Usuários</span>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="ROLE_ADMIN">
              <Link to="/admin/roles" className={linkClass('/admin/roles')} title={isCollapsed ? "Perfis de Acesso" : ""}>
                <Shield size={20} className={iconClass('/admin/roles')} />
                {!isCollapsed && <span>Perfis de Acesso</span>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="SETTINGS_VIEW">
              <Link to="/admin/settings" className={linkClass('/admin/settings')} title={isCollapsed ? "Configurações" : ""}>
                <Settings size={20} className={iconClass('/admin/settings')} />
                {!isCollapsed && <span>Configurações</span>}
              </Link>
            </RequirePermission>
          </SidebarGroup>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          {!isCollapsed ? (
            <div className="mb-4 px-2">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Sair" : ""}
            className={`w-full flex items-center gap-3 py-2.5 rounded-lg hover:bg-red-500/10 text-slate-300 hover:text-red-400 transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-6 lg:px-8 shadow-sm z-10 sticky top-0">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Painel Administrativo</h2>
        </header>
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
