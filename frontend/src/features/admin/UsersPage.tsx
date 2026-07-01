import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { RequirePermission } from '../auth/RequirePermission';
import { useAuth } from '../auth/AuthContext';
import { Plus, Edit2, Ban, CheckCircle, Trash2, Lock, Unlock } from 'lucide-react';
import { UserFormModal } from './components/UserFormModal';

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  active: boolean;
  roles: string[];
}

const getRoleRank = (roleName: string) => {
  switch (roleName) {
    case "ROLE_ADMIN": return 100;
    case "ROLE_GESTOR": return 80;
    case "ROLE_ANALISTA": return 60;
    case "ROLE_REPRESENTANTE": return 40;
    default: return 0;
  }
};

const getMaxRank = (roles: string[]) => {
  return roles.reduce((max, role) => Math.max(max, getRoleRank(role)), 0);
};

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    setUserToEdit(user || null);
    setIsModalOpen(true);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'inativar' : 'ativar';
    if (!window.confirm(`Tem certeza que deseja ${action} este usuário?`)) return;
    
    try {
      await api.patch(`/admin/users/${id}/toggle-active`);
      fetchUsers();
    } catch (error) {
      console.error(`Falha ao ${action} usuário`, error);
      alert(`Erro ao tentar ${action} o usuário.`);
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('CUIDADO: Tem certeza que deseja EXCLUIR PERMANENTEMENTE este usuário? Esta ação não pode ser desfeita e pode falhar se o usuário tiver registros vinculados.')) return;
    
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Falha ao excluir usuário', error);
      alert('Erro ao tentar excluir o usuário. É provável que ele já possua registros vinculados no sistema. Tente inativá-lo em vez disso.');
    }
  };

  const currentUserRank = currentUser ? getMaxRank(currentUser.authorities) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Usuários</h1>
          <p className="text-slate-500">Gerencie os usuários do sistema e seus acessos.</p>
        </div>
        
        <RequirePermission permission="usuarios:criar">
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Novo Usuário
          </button>
        </RequirePermission>
      </div>

      {isModalOpen && (
        <UserFormModal 
          userToEdit={userToEdit}
          onClose={() => {
            setIsModalOpen(false);
            setUserToEdit(null);
          }} 
          onSuccess={() => {
            setIsModalOpen(false);
            setUserToEdit(null);
            fetchUsers();
          }} 
        />
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const targetUserRank = getMaxRank(user.roles);
                const canModify = currentUserRank >= targetUserRank;

                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 text-slate-600 capitalize">{user.userType.toLowerCase()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active ? <CheckCircle size={14} /> : <Ban size={14} />}
                        {user.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {canModify && (
                        <>
                          <RequirePermission permission="usuarios:editar">
                            <button 
                              onClick={() => handleOpenModal(user)}
                              className="text-slate-400 hover:text-blue-600 transition-colors" 
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>
                          </RequirePermission>
                          <RequirePermission permission="usuarios:inativar">
                            <button 
                              onClick={() => toggleActive(user.id, user.active)}
                              className={`${user.active ? 'text-amber-500 hover:text-amber-600' : 'text-emerald-500 hover:text-emerald-600'} transition-colors ml-2`} 
                              title={user.active ? "Inativar Usuário" : "Ativar Usuário"}
                            >
                              {user.active ? <Lock size={18} /> : <Unlock size={18} />}
                            </button>
                          </RequirePermission>
                          <RequirePermission permission="usuarios:excluir">
                            <button 
                              onClick={() => deleteUser(user.id)}
                              className="text-red-400 hover:text-red-600 transition-colors ml-2" 
                              title="Excluir Permanentemente"
                            >
                              <Trash2 size={18} />
                            </button>
                          </RequirePermission>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
