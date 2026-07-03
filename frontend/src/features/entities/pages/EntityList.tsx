import { useState, useEffect } from 'react';
import { entityService } from '../services/entity.service';
import type { LegalEntity } from '../types/entity';
import { RequirePermission } from '../../auth/RequirePermission';
import { Plus, Edit2, Search, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';

export function EntityList() {
  const [entities, setEntities] = useState<LegalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityToDelete, setEntityToDelete] = useState<LegalEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const data = await entityService.getAll();
      setEntities(data);
    } catch (error) {
      console.error('Failed to fetch entities', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (entity: LegalEntity) => {
    setEntityToDelete(entity);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!entityToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await entityService.delete(entityToDelete.id);
      await fetchEntities();
      setEntityToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete entity', error);
      if (error.response?.status === 409) {
        setDeleteError(error.response.data || 'Não é possível excluir esta entidade.');
      } else {
        setDeleteError('Erro ao excluir entidade.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-medium">Habilitada</span>;
      case 'INATIVA':
        return <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full text-xs font-medium">Inativa</span>;
      case 'SUSPENSA':
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-medium">Suspensa</span>;
      case 'ENCERRADA':
        return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-medium">Encerrada</span>;
      case 'PENDENTE_VALIDACAO':
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">Pendente Validação</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const formatCnpj = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Entidades</h1>
          <p className="text-slate-500">Gestão do Cadastro Base de Entidades.</p>
        </div>
        
        <RequirePermission permission="entidades:criar">
          <button 
            onClick={() => window.location.href = '/admin/entities/new'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Nova Entidade
          </button>
        </RequirePermission>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por CNPJ ou Razão Social..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
           </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">CNPJ</th>
                <th className="px-6 py-4">Razão Social</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entities.map((entity) => (
                <tr key={entity.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    {formatCnpj(entity.cnpj)}
                  </td>
                  <td className="px-6 py-4 text-slate-900">
                    <div>{entity.corporateName}</div>
                    {entity.tradeName && <div className="text-xs text-slate-500">{entity.tradeName}</div>}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(entity.status)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <RequirePermission permission="entidades:editar">
                      <button 
                        onClick={() => window.location.href = `/admin/entities/${entity.id}`}
                        className="text-slate-400 hover:text-blue-600 transition-colors" title="Detalhes / Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                    </RequirePermission>
                    <RequirePermission permission="ROLE_ADMIN">
                      <button 
                        onClick={() => handleDeleteClick(entity)}
                        className="text-slate-400 hover:text-red-600 transition-colors" title="Excluir Entidade"
                      >
                        <Trash2 size={18} />
                      </button>
                    </RequirePermission>
                  </td>
                </tr>
              ))}
              {entities.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma entidade encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={!!entityToDelete}
        onClose={() => { setEntityToDelete(null); setDeleteError(null); }}
        onConfirm={handleConfirmDelete}
        title="Excluir Entidade"
        message={deleteError || `Tem certeza que deseja excluir permanentemente a entidade ${entityToDelete?.corporateName}? Esta ação apagará todos os endereços, contatos e representantes.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
