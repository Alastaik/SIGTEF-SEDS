import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Shield, ShieldAlert, Check } from 'lucide-react';
import { RequirePermission } from '../../features/auth/RequirePermission';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/admin/roles'),
        api.get('/admin/roles/permissions')
      ]);
      setRoles(rolesRes.data);
      setAllPermissions(permsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setEditedPermissions([...role.permissions]);
  };

  const handleTogglePermission = (perm: string) => {
    setEditedPermissions(prev => 
      prev.includes(perm) 
        ? prev.filter(p => p !== perm)
        : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const res = await api.put(`/admin/roles/${selectedRole.id}`, editedPermissions);
      // Update local state
      setRoles(prev => prev.map(r => r.id === res.data.id ? res.data : r));
      setSelectedRole(res.data);
      alert('Permissões salvas com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar permissões.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="flex bg-white rounded-lg min-h-[600px] border border-slate-200 overflow-hidden">
      {/* Sidebar - Perfis */}
      <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Shield size={18} className="text-slate-600" /> 
            Perfis de Acesso
          </h3>
          <p className="text-xs text-slate-500 mt-1">Selecione um perfil para editar suas permissões</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => handleSelectRole(role)}
              className={`w-full text-left px-4 py-3 rounded-md transition-colors ${selectedRole?.id === role.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'}`}
            >
              <div className="font-semibold">{role.name.replace('ROLE_', '')}</div>
              <div className={`text-xs mt-1 ${selectedRole?.id === role.id ? 'text-blue-100' : 'text-slate-500'}`}>
                {role.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Area - Permissões */}
      <div className="w-2/3 flex flex-col bg-white">
        {selectedRole ? (
          <>
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Permissões de {selectedRole.name.replace('ROLE_', '')}</h2>
                <p className="text-sm text-slate-500 mt-1">Marque as permissões que os usuários com este perfil terão.</p>
              </div>
              <RequirePermission permission="ROLE_ADMIN">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  <Check size={18} />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </RequirePermission>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {selectedRole.name === 'ROLE_ADMIN' && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3 text-yellow-800 text-sm">
                  <ShieldAlert size={20} className="shrink-0" />
                  <p><strong>Atenção:</strong> O perfil de Administrador Geral costuma ignorar checagens de permissão explícitas em várias partes do código (ex: <code>hasAuthority('ROLE_ADMIN')</code>). A seleção aqui é mais ilustrativa para outras camadas.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allPermissions.sort().map(perm => {
                  const isChecked = editedPermissions.includes(perm);
                  return (
                    <label 
                      key={perm} 
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isChecked ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                    >
                      <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(perm)}
                      />
                      <span className="text-sm font-mono text-slate-700 break-all">{perm}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-4">
            <Shield size={64} className="text-slate-200" />
            <p>Selecione um perfil de acesso na lateral esquerda para gerenciar as permissões associadas a ele.</p>
          </div>
        )}
      </div>
    </div>
  );
}
