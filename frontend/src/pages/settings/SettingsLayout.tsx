import { Outlet, NavLink } from 'react-router';

export function SettingsLayout() {
  const tabs = [
    { name: 'Geral', path: '/admin/settings/general' },
    { name: 'Competências', path: '/admin/settings/competences' },
    { name: 'Templates', path: '/admin/settings/templates' },
    { name: 'Feature Flags', path: '/admin/settings/flags' },
    { name: 'Perfis de Acesso', path: '/admin/settings/roles' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h2>
        <p className="text-slate-500 mt-1">Gerencie os parâmetros globais, competências e templates.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="border-b border-slate-200 px-6 pt-4">
          <nav className="flex space-x-6">
            {tabs.map((tab) => (
              <NavLink
                key={tab.name}
                to={tab.path}
                className={({ isActive }) =>
                  `pb-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
