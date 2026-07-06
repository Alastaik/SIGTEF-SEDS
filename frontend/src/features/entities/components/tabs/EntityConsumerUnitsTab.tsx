import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { LegalEntity, UtilityType, LegalEntityConsumerUnit } from '../../types/entity';
import { entityService } from '../../services/entity.service';
import { Plus, Zap, Droplet, Flame, Lightbulb, Trash2, Edit2, AlertCircle } from 'lucide-react';

interface Props {
  entity: LegalEntity;
  onUpdate: () => void;
}

export function EntityConsumerUnitsTab({ entity, onUpdate }: Props) {
  const { id: entityId } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Edit & Delete states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ucToDelete, setUcToDelete] = useState<LegalEntityConsumerUnit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    utilityType: 'ENERGIA' as UtilityType,
    unitNumber: '',
    providerId: '00000000-0000-0000-0000-000000000000', // Mock domain data ID
  });

  const handleOpenModal = (uc?: LegalEntityConsumerUnit) => {
    setError('');
    if (uc) {
      setEditingId(uc.id);
      setFormData({
        utilityType: uc.utilityType,
        unitNumber: uc.unitNumber,
        providerId: uc.provider?.id || '00000000-0000-0000-0000-000000000000',
      });
    } else {
      setEditingId(null);
      setFormData({ utilityType: 'ENERGIA', unitNumber: '', providerId: '00000000-0000-0000-0000-000000000000' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !entityId) return;
    setIsSubmitting(true);
    setError('');
    try {
      if (editingId) {
        await entityService.updateConsumerUnit(entityId, editingId, formData);
      } else {
        await entityService.addConsumerUnit(entityId, formData);
      }
      setIsModalOpen(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar unidade consumidora');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (uc: LegalEntityConsumerUnit) => {
    setUcToDelete(uc);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!ucToDelete || !entityId || isDeleting) return;
    setIsDeleting(true);
    try {
      await entityService.deleteConsumerUnit(entityId, ucToDelete.id);
      setDeleteModalOpen(false);
      setUcToDelete(null);
      onUpdate();
    } catch (err: any) {
      console.error('Failed to delete', err);
      // Podes adicionar um toast de erro se tivermos, mas alert é fallback
      alert('Erro ao excluir unidade consumidora.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getUtilityIcon = (type: UtilityType) => {
    switch(type) {
      case 'ENERGIA': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'AGUA': return <Droplet className="w-5 h-5 text-blue-500" />;
      case 'GAS': return <Flame className="w-5 h-5 text-orange-500" />;
      default: return <Lightbulb className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Unidades Consumidoras</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nova Unidade
        </button>
      </div>

      {entity.consumerUnits && entity.consumerUnits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {entity.consumerUnits.map(uc => (
            <div key={uc.id} className="p-4 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors bg-white group relative">
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-1">
                <button 
                  onClick={() => handleOpenModal(uc)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Editar UC"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteClick(uc)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir UC"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-start gap-4 pr-16">
                <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                  {getUtilityIcon(uc.utilityType)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-slate-800 truncate">UC: {uc.unitNumber}</h3>
                  <p className="text-sm text-slate-500 mt-1 truncate" title={uc.provider?.name || 'Não informada'}>
                    Concessionária: {uc.provider?.name || 'Não informada'}
                  </p>
                  <p className="text-xs font-medium text-slate-400 mt-2 uppercase tracking-wider">
                    {uc.utilityType}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-slate-800">Nenhuma UC cadastrada</h3>
          <p className="text-sm text-slate-500 mt-1">Cadastre as contas de Energia, Água e Gás da entidade.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Excluir Unidade Consumidora</h3>
            </div>
            
            <p className="text-slate-600 mb-6">
              Tem certeza que deseja excluir a UC <strong>{ucToDelete?.unitNumber}</strong>? 
              Esta ação não poderá ser desfeita.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingId ? 'Editar Unidade Consumidora' : 'Nova Unidade Consumidora'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Serviço</label>
                <select
                  required
                  value={formData.utilityType}
                  onChange={e => setFormData({...formData, utilityType: e.target.value as UtilityType})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ENERGIA">Energia Elétrica</option>
                  <option value="AGUA">Água e Esgoto</option>
                  <option value="GAS">Gás Canalizado</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número da Unidade (UC)</label>
                <input
                  type="text"
                  required
                  value={formData.unitNumber}
                  onChange={e => setFormData({...formData, unitNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: 100234567"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : (editingId ? 'Atualizar UC' : 'Salvar UC')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
