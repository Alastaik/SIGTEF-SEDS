import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { RequirePermission } from '../auth/RequirePermission';
import { Plus, Edit2, ShieldAlert } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/admin/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to fetch roles', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Perfis de Acesso</h1>
          <p className="text-slate-500">Configure os níveis de permissão do sistema.</p>
        </div>
        
        <RequirePermission permission="ROLE_ADMIN">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors">
            <Plus size={18} />
            Novo Perfil
          </button>
        </RequirePermission>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Carregando...</div>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-md">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{role.name}</h3>
                    <p className="text-sm text-slate-500">{role.permissions.length} permissões</p>
                  </div>
                </div>
                <RequirePermission permission="ROLE_ADMIN">
                  <button className="text-slate-400 hover:text-blue-600 transition-colors">
                    <Edit2 size={18} />
                  </button>
                </RequirePermission>
              </div>
              <p className="text-sm text-slate-600 mb-6 flex-1">{role.description}</p>
              
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Principais Permissões</h4>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.slice(0, 3).map(p => (
                    <span key={p} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                      {p}
                    </span>
                  ))}
                  {role.permissions.length > 3 && (
                    <span className="bg-slate-50 text-slate-500 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                      +{role.permissions.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
