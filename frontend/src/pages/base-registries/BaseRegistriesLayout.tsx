import { Outlet, NavLink } from 'react-router-dom';

export function BaseRegistriesLayout() {
  const menuItems = [
    { name: 'Dashboard', path: '/admin/base-registries', exact: true },
    { name: 'Municípios e Regiões', path: '/admin/base-registries/regions-cities' },
    { name: 'Programas', path: '/admin/base-registries/programs' },
    { name: 'Valores dos Programas', path: '/admin/base-registries/program-values' },
    { name: 'Tipos de Documento', path: '/admin/base-registries/documents' },
    { name: 'Tipos de Pendência', path: '/admin/base-registries/issues' },
    { name: 'Tipos de Termo', path: '/admin/base-registries/domain/TIPO_TERMO' },
    { name: 'Tipos de Processo', path: '/admin/base-registries/domain/TIPO_PROCESSO' },
    { name: 'Tipos de Objeto', path: '/admin/base-registries/domain/TIPO_OBJETO' },
    { name: 'Naturezas de Atend.', path: '/admin/base-registries/domain/NATUREZA_ATENDIMENTO' },
    { name: 'Concessionárias', path: '/admin/base-registries/domain/CONCESSIONARIA' },
    { name: 'Feriados', path: '/admin/base-registries/holidays' },
  ];

  return (
    <div className="flex h-full gap-6">
      {/* Menu Lateral Esquerdo */}
      <div className="w-64 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-6rem)] sticky top-24">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h2 className="font-bold text-slate-800">Cadastros Base</h2>
          <p className="text-xs text-slate-500">Tabelas auxiliares e de domínio</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `block px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 font-semibold' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 min-h-[calc(100vh-6rem)]">
        <Outlet />
      </div>
    </div>
  );
}
