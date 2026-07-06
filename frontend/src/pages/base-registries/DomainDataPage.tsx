import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Edit2, Trash2, X, Database } from 'lucide-react';
import { RequirePermission } from '../../features/auth/RequirePermission';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';
import { useParams } from 'react-router-dom';

interface DomainData {
  id: string;
  domainType: string;
  name: string;
  code: string | null;
  description: string | null;
  extraInfo: string | null;
  active: boolean;
}

const TITLE_MAP: Record<string, string> = {
  'TIPO_TERMO': 'Tipos de Termo',
  'TIPO_PROCESSO': 'Tipos de Processo',
  'TIPO_OBJETO': 'Tipos de Objeto',
  'NATUREZA_ATENDIMENTO': 'Naturezas de Atendimento',
  'CONCESSIONARIA': 'Concessionárias'
};

export function DomainDataPage() {
  const { type } = useParams<{ type: string }>();
  
  const [dataList, setDataList] = useState<DomainData[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<DomainData | null>(null);
  const [saving, setSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<DomainData | null>(null);

  const pageTitle = type ? (TITLE_MAP[type] || 'Gerenciamento de Domínio') : 'Gerenciamento de Domínio';

  useEffect(() => {
    if (type) {
      fetchData();
    }
  }, [type]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/domain-data/type/${type}`);
      setDataList(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedEntity({
      id: '',
      domainType: type || '',
      name: '',
      code: '',
      description: '',
      extraInfo: '',
      active: true
    });
    setShowModal(true);
  };

  const handleEdit = (entity: DomainData) => {
    setSelectedEntity({ ...entity });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedEntity || !selectedEntity.name) {
      return alert('O nome é obrigatório.');
    }

    setSaving(true);
    try {
      if (selectedEntity.id) {
        await api.put(`/domain-data/${selectedEntity.id}`, selectedEntity);
      } else {
        await api.post(`/domain-data`, selectedEntity);
      }
      setShowModal(false);
      setSelectedEntity(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar os dados.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = (entity: DomainData) => {
    setEntityToDelete(entity);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!entityToDelete?.id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/domain-data/${entityToDelete.id}`);
      setShowDeleteModal(false);
      setEntityToDelete(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir registro. Pode haver referências a ele no banco de dados.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{pageTitle}</h1>
          <p className="text-sm text-slate-500">
            Gerenciamento de tabelas auxiliares do tipo <span className="font-mono bg-slate-100 px-1 rounded">{type}</span>
          </p>
        </div>
        <RequirePermission permission="SETTINGS_MANAGE">
          <button 
            onClick={handleNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Plus size={20} />
            Novo Registro
          </button>
        </RequirePermission>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {dataList.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Nome</th>
                <th className="px-6 py-4 font-semibold">Código</th>
                <th className="px-6 py-4 font-semibold">Descrição</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{item.code || '-'}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={item.description || ''}>
                    {item.description || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${item.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <RequirePermission permission="SETTINGS_MANAGE">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRequest(item)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </RequirePermission>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center">
            <Database size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">Nenhum registro encontrado</h3>
            <p className="text-slate-500 mb-6">Não há dados cadastrados para este tipo de domínio ainda.</p>
            <RequirePermission permission="SETTINGS_MANAGE">
              <button 
                onClick={handleNew}
                className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 hover:underline"
              >
                <Plus size={18} />
                Criar o primeiro registro
              </button>
            </RequirePermission>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && selectedEntity && (
        <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                {selectedEntity.id ? `Editar ${pageTitle}` : `Novo ${pageTitle}`}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome *</label>
                <input 
                  type="text" required
                  value={selectedEntity.name} 
                  onChange={e => setSelectedEntity({...selectedEntity, name: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="Nome do registro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Código Único (Opcional)</label>
                <input 
                  type="text" 
                  value={selectedEntity.code || ''} 
                  onChange={e => setSelectedEntity({...selectedEntity, code: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm transition-colors" 
                  placeholder="Ex: COD-123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição (Opcional)</label>
                <textarea 
                  rows={3}
                  value={selectedEntity.description || ''} 
                  onChange={e => setSelectedEntity({...selectedEntity, description: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="Detalhes ou finalidade deste registro..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Informações Extras (JSON/Texto Opcional)</label>
                <input 
                  type="text" 
                  value={selectedEntity.extraInfo || ''} 
                  onChange={e => setSelectedEntity({...selectedEntity, extraInfo: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm font-mono" 
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={selectedEntity.active}
                    onChange={e => setSelectedEntity({...selectedEntity, active: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-slate-700">Registro Ativo</span>
                </label>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving ? 'Salvando...' : 'Salvar Registro'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title={`Excluir ${pageTitle}`}
        message="Tem certeza que deseja excluir permanentemente este registro? Ação irreversível."
        isDeleting={isDeleting}
      />
    </div>
  );
}
