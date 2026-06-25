import { useEffect, useState } from 'react';
import { programService, type Program } from '../../services/programService';
import { Save, Plus, Trash2 } from 'lucide-react';
import { RequirePermission } from '../../features/auth/RequirePermission';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';

export function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Program | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await programService.getAll();
      setPrograms(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (p: Program) => {
    setSelected({ ...p });
  };

  const handleNew = () => {
    setSelected({
      id: '',
      name: '',
      type: 'NATUREZA_ATENDIMENTO', // Adjust later based on domains
      code: '',
      description: '',
      requiresGoal: false,
      requiresServiceDays: false,
      requiresConsumerUnit: false,
      requiresInvoice: false,
      requiresReceipt: false,
      active: true,
      calculationType: 'VALOR_FIXO' as any // Adding calculationType to the default state
    } as any);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      if (selected.id) {
        await programService.update(selected.id, selected);
      } else {
        await programService.create(selected);
      }
      alert('Salvo com sucesso!');
      await fetchPrograms();
      setSelected(null);
    } catch (error) {
      alert('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected?.id) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await programService.delete(selected.id);
      setShowDeleteModal(false);
      setSelected(null);
      await fetchPrograms();
    } catch (error: any) {
      console.error('Failed to delete program', error);
      if (error.response?.status === 409) {
        setDeleteError(error.response.data || 'Não é possível excluir este programa pois existem Termos de Fomento vinculados a ele.');
      } else {
        setDeleteError('Erro ao excluir programa.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const updateField = (field: keyof Program | 'calculationType', value: any) => {
    if (selected) {
      setSelected({ ...selected, [field]: value } as any);
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="flex h-full">
      {/* Lista lateral */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col h-full bg-white">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Programas</h3>
          <button onClick={handleNew} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {programs.map(p => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${selected?.id === p.id ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' : 'text-slate-600 hover:bg-slate-100 border border-transparent'}`}
            >
              <div className="flex justify-between items-center">
                <span>{p.name}</span>
                {!p.active && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded font-bold">INATIVO</span>}
              </div>
              <div className="text-xs text-slate-400 mt-1">{p.code || 'Sem código'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Form de edição */}
      <div className="w-2/3 p-6 overflow-y-auto bg-slate-50/50">
        {selected ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-800">{selected.id ? 'Editar Programa' : 'Novo Programa'}</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-slate-600">Status:</span>
                <button 
                  onClick={() => updateField('active', !selected.active)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${selected.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                  {selected.active ? 'ATIVO' : 'INATIVO'}
                </button>
                {selected.id && (
                  <RequirePermission permission="ROLE_GESTOR">
                    <button 
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors ml-2"
                      title="Excluir Programa"
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </RequirePermission>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Programa</label>
                <input type="text" value={selected.name} onChange={e => updateField('name', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código Opcional</label>
                <input type="text" value={selected.code || ''} onChange={e => updateField('code', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <textarea rows={3} value={selected.description || ''} onChange={e => updateField('description', e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Regras Operacionais e Cálculo</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Cálculo (Fórmula)</label>
                <select 
                  value={(selected as any).calculationType || 'VALOR_FIXO'} 
                  onChange={e => updateField('calculationType', e.target.value)} 
                  disabled={!!selected.id} // Cravado após criação!
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="POR_META">Por Meta Diária (Meta * Dias * Valor Per Capita)</option>
                  <option value="VALOR_FIXO">Valor Fixo Mensal (Tabela Base)</option>
                  <option value="REEMBOLSO">Reembolso (Pelo valor da Conta/Fatura, Limitado a Tabela)</option>
                  <option value="LIMITE_MENSAL">Teto/Limite Mensal Fixo (Valor Base)</option>
                </select>
                {selected.id && <p className="text-xs text-slate-500 mt-1">O tipo de cálculo não pode ser alterado após a criação do programa.</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={selected.requiresGoal} onChange={e => updateField('requiresGoal', e.target.checked)} className="mt-1" />
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Exige Meta/Quantidade</span>
                    <span className="text-xs text-slate-500">Pede quantidade de pessoas/vagas no termo.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={selected.requiresServiceDays} onChange={e => updateField('requiresServiceDays', e.target.checked)} className="mt-1" />
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Exige Dias Atendimento</span>
                    <span className="text-xs text-slate-500">Pede quantos dias por semana/mês atende.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={selected.requiresConsumerUnit} onChange={e => updateField('requiresConsumerUnit', e.target.checked)} className="mt-1" />
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Exige Unidade Consumidora</span>
                    <span className="text-xs text-slate-500">Pede número da conta (Água/Energia).</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={selected.requiresInvoice} onChange={e => updateField('requiresInvoice', e.target.checked)} className="mt-1" />
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Exige Nota Fiscal</span>
                    <span className="text-xs text-slate-500">Obrigatório nota fiscal para prestação.</span>
                  </div>
                </label>
                
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={selected.requiresReceipt} onChange={e => updateField('requiresReceipt', e.target.checked)} className="mt-1" />
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Exige Recibo/Boleto</span>
                    <span className="text-xs text-slate-500">Obrigatório recibo ou boleto para prestação.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                <Save size={18} />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            Selecione um Programa ao lado para editar.
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteError(null); }}
        onConfirm={handleDelete}
        title="Excluir Programa"
        message={deleteError || `Tem certeza que deseja excluir permanentemente o programa ${selected?.name}?`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
