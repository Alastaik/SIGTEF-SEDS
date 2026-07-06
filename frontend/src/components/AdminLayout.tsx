import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { RequirePermission } from '../features/auth/RequirePermission';
import {
  Users, Shield, LogOut, LayoutDashboard, Settings,
  Building2, FileText, CalendarDays, Bell, BarChart2,
  FileCheck, CheckSquare, FileUp, ChevronLeft, ChevronRight,
  ChevronDown, AlertTriangle, Zap, Database, Layers
} from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    gestao: true,
    repasses: true,
    monitoramento: true,
    sistema: true
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleGroup = (group: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const linkClass = (href: string) => {
    const isActive = location.pathname === href || (href !== '/admin' && location.pathname.startsWith(href));
    return `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
      isActive
        ? 'bg-gradient-to-r from-indigo-500/10 to-transparent text-indigo-400 font-medium'
        : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
    } ${isCollapsed ? 'justify-center' : ''}`;
  };

  const iconClass = (href: string) => {
    const isActive = location.pathname === href || (href !== '/admin' && location.pathname.startsWith(href));
    return `shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-300'} transition-colors`;
  };

  const SidebarGroup = ({ id, label, children }: { id: string, label: string, children: React.ReactNode }) => (
    <div className="mb-6">
      {!isCollapsed ? (
        <div 
          className="flex items-center justify-between px-3 py-1.5 mb-2 cursor-pointer group/header"
          onClick={() => toggleGroup(id)}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover/header:text-slate-300 transition-colors">
            {label}
          </span>
          <ChevronDown 
            size={14} 
            className={`text-slate-600 transition-transform duration-300 ${openGroups[id] ? 'rotate-180 text-slate-400' : ''}`} 
          />
        </div>
      ) : (
        <div className="flex justify-center py-2 mb-2">
          <div className="h-0.5 w-6 bg-slate-800 rounded-full"></div>
        </div>
      )}
      <div className={`space-y-1.5 overflow-hidden transition-all duration-300 ${!isCollapsed && !openGroups[id] ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`${isCollapsed ? 'w-20' : 'w-72'} shrink-0 bg-emerald-950 text-white flex flex-col h-full transition-all duration-300 relative z-20 border-r border-slate-800/60 shadow-2xl`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-7 bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-full shadow-lg shadow-indigo-500/20 transition-all z-50 focus:outline-none ring-4 ring-slate-50"
        >
          {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
        </button>

        {/* Logo Section */}
        <div className={`p-6 border-b border-emerald-950/60 flex flex-col items-center justify-center shrink-0 min-h-[140px] transition-all bg-gradient-to-b from-emerald-950/50 to-transparent`}>
          {!isCollapsed ? (
            <>
              <img
                src="/logo-seds.png"
                alt="SEDS Logo"
                className="w-24 mb-4 object-contain brightness-0 invert opacity-90 transition-all duration-300 drop-shadow-md"
              />
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">SIGTEF</h1>
                <p className="text-[10px] text-emerald-400/80 mt-1 uppercase tracking-widest font-semibold">Gestão de Fomentos</p>
              </div>
            </>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg font-black text-xl text-white">
              S
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          <Link to="/admin" className={`${linkClass('/admin')} mb-6`} title={isCollapsed ? "Dashboard" : ""}>
            <LayoutDashboard size={20} className={iconClass('/admin')} />
            {!isCollapsed && <span className="font-semibold text-slate-200">Dashboard</span>}
            {location.pathname === '/admin' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
            )}
          </Link>

          <SidebarGroup id="gestao" label="Gestão">
            <RequirePermission permission="entidades:visualizar">
              <Link to="/admin/entities" className={linkClass('/admin/entities')} title={isCollapsed ? "Entidades" : ""}>
                <Building2 size={18} className={iconClass('/admin/entities')} />
                {!isCollapsed && <span>Entidades</span>}
                {location.pathname.startsWith('/admin/entities') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="agreements:view">
              <Link to="/admin/agreements" className={linkClass('/admin/agreements')} title={isCollapsed ? "Termos de Fomento" : ""}>
                <FileText size={18} className={iconClass('/admin/agreements')} />
                {!isCollapsed && <span>Termos de Fomento</span>}
                {location.pathname.startsWith('/admin/agreements') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
              </Link>
            </RequirePermission>
          </SidebarGroup>

          <SidebarGroup id="repasses" label="Repasses & Prestação">
            <RequirePermission permission="ROLE_GESTOR">
              <Link to="/admin/executions" className={linkClass('/admin/executions')} title={isCollapsed ? "Lançamentos Mensais" : ""}>
                <CalendarDays size={18} className={iconClass('/admin/executions')} />
                {!isCollapsed && <span>Lançamentos Mensais</span>}
                {location.pathname.startsWith('/admin/executions') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="ROLE_SEDS">
              <Link to="/admin/energy" className={linkClass('/admin/energy')} title={isCollapsed ? "Auxílio Energia" : ""}>
                <Zap size={18} className={iconClass('/admin/energy')} />
                {!isCollapsed && <span>Auxílio Energia</span>}
                {location.pathname.startsWith('/admin/energy') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="ROLE_SEDS">
              <Link to="/admin/analysis" className={linkClass('/admin/analysis')} title={isCollapsed ? "Análise de Prestações" : ""}>
                <FileCheck size={18} className={iconClass('/admin/analysis')} />
                {!isCollapsed && <span>Análise de Prestações</span>}
                {location.pathname.startsWith('/admin/analysis') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
              </Link>
            </RequirePermission>
            
            <RequirePermission permission="ROLE_SEDS">
              <Link to="/admin/atrasos" className={linkClass('/admin/atrasos')} title={isCollapsed ? "Inadimplentes" : ""}>
                <AlertTriangle size={18} className={iconClass('/admin/atrasos')} />
                {!isCollapsed && <span>Inadimplentes</span>}
                {location.pathname.startsWith('/admin/atrasos') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
              </Link>
            </RequirePermission>
          </SidebarGroup>

          <SidebarGroup id="monitoramento" label="Monitoramento">
            <RequirePermission permission="ROLE_SEDS">
              <Link to="/admin/inspections" className={linkClass('/admin/inspections')} title={isCollapsed ? "Fiscalização" : ""}>
                <CheckSquare size={18} className={iconClass('/admin/inspections')} />
                {!isCollapsed && <span>Fiscalização</span>}
                {location.pathname.startsWith('/admin/inspections') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="reports:view">
              <Link to="/admin/reports" className={linkClass('/admin/reports')} title={isCollapsed ? "Relatórios" : ""}>
                <BarChart2 size={18} className={iconClass('/admin/reports')} />
                {!isCollapsed && <span>Relatórios</span>}
                {location.pathname.startsWith('/admin/reports') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="notifications:view">
              <Link to="/admin/notifications" className={linkClass('/admin/notifications')} title={isCollapsed ? "Notificações" : ""}>
                <Bell size={18} className={iconClass('/admin/notifications')} />
                {!isCollapsed && <span>Notificações</span>}
                {location.pathname.startsWith('/admin/notifications') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
              </Link>
            </RequirePermission>
          </SidebarGroup>

          <SidebarGroup id="sistema" label="Sistema">
            <RequirePermission permission="ROLE_ADMIN">
              <Link to="/admin/base-registries" className={linkClass('/admin/base-registries')} title={isCollapsed ? "Cadastros Base" : ""}>
                <Database size={18} className={iconClass('/admin/base-registries')} />
                {!isCollapsed && <span>Cadastros Base</span>}
                {location.pathname.startsWith('/admin/base-registries') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="ROLE_ADMIN">
              <Link to="/admin/imports" className={linkClass('/admin/imports')} title={isCollapsed ? "Importações" : ""}>
                <FileUp size={18} className={iconClass('/admin/imports')} />
                {!isCollapsed && <span>Importações</span>}
                {location.pathname.startsWith('/admin/imports') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="usuarios:visualizar">
              <Link to="/admin/users" className={linkClass('/admin/users')} title={isCollapsed ? "Usuários" : ""}>
                <Users size={18} className={iconClass('/admin/users')} />
                {!isCollapsed && <span>Usuários</span>}
                {location.pathname.startsWith('/admin/users') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="ROLE_ADMIN">
              <Link to="/admin/roles" className={linkClass('/admin/roles')} title={isCollapsed ? "Perfis de Acesso" : ""}>
                <Shield size={18} className={iconClass('/admin/roles')} />
                {!isCollapsed && <span>Perfis de Acesso</span>}
                {location.pathname.startsWith('/admin/roles') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
              </Link>
            </RequirePermission>

            <RequirePermission permission="SETTINGS_VIEW">
              <Link to="/admin/settings" className={linkClass('/admin/settings')} title={isCollapsed ? "Configurações" : ""}>
                <Settings size={18} className={iconClass('/admin/settings')} />
                {!isCollapsed && <span>Configurações</span>}
                {location.pathname.startsWith('/admin/settings') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
              </Link>
            </RequirePermission>
          </SidebarGroup>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-emerald-950/30 backdrop-blur-sm">
          {!isCollapsed ? (
            <div className="mb-4 px-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Sair" : ""}
            className={`w-full flex items-center gap-3 py-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="font-medium text-sm">Sair da Conta</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 relative">
        <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 h-16 flex items-center justify-between px-6 lg:px-8 z-10 sticky top-0">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Painel Administrativo</h2>
          <div className="flex items-center gap-4">
            {/* Can add top bar items here in the future */}
          </div>
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
