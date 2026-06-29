import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, Edit2, X, DollarSign, Calendar } from 'lucide-react';
import { RequirePermission } from '../../features/auth/RequirePermission';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';
import { format } from 'date-fns';

interface Program {
  id: string;
  name: string;
  active: boolean;
}

interface ProgramValueTable {
  id: string;
  perCapitaValue: number | null;
  standardMonthlyValue: number | null;
  unit: string;
  validFrom: string;
  validTo: string | null;
  publicationDate: string | null;
  observation: string;
}

export function ProgramValuesPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  
  const [values, setValues] = useState<ProgramValueTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingValues, setLoadingValues] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState<ProgramValueTable | null>(null);
  const [saving, setSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [valueToDelete, setValueToDelete] = useState<ProgramValueTable | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/programs');
      setPrograms(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchValues = async (programId: string) => {
    setLoadingValues(true);
    try {
      const res = await api.get(`/programs/${programId}/values`);
      setValues(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingValues(false);
    }
  };

  const handleSelectProgram = (p: Program) => {
    setSelectedProgram(p);
    fetchValues(p.id);
  };

  const handleNewValue = () => {
    setSelectedValue({
      id: '',
      perCapitaValue: null,
      standardMonthlyValue: null,
      unit: '',
      validFrom: format(new Date(), 'yyyy-MM-dd'),
      validTo: null,
      publicationDate: null,
      observation: ''
    });
    setShowModal(true);
  };

  const handleEditValue = (v: ProgramValueTable) => {
    setSelectedValue({ ...v });
    setShowModal(true);
  };

  const handleSaveValue = async () => {
    if (!selectedProgram || !selectedValue) return;
    if (!selectedValue.validFrom) {
      return alert('A Data de Início (Válido a partir de) é obrigatória.');
    }

    setSaving(true);
    try {
      if (selectedValue.id) {
        await api.put(`/programs/${selectedProgram.id}/values/${selectedValue.id}`, selectedValue);
      } else {
        await api.post(`/programs/${selectedProgram.id}/values`, selectedValue);
      }
      setShowModal(false);
      setSelectedValue(null);
      await fetchValues(selectedProgram.id);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar os valores.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = (v: ProgramValueTable) => {
    setValueToDelete(v);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProgram || !valueToDelete?.id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/programs/${selectedProgram.id}/values/${valueToDelete.id}`);
      setShowDeleteModal(false);
      setValueToDelete(null);
      await fetchValues(selectedProgram.id);
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir registro de valor.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    // assuming yyyy-mm-dd
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="flex h-full bg-slate-50">
      {/* Sidebar - Programas */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col h-full bg-white">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800">Programas</h3>
          <p className="text-xs text-slate-500">Selecione para ver o histórico</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {programs.map(p => (
            <button
              key={p.id}
              onClick={() => handleSelectProgram(p)}
              className={`w-full text-left px-3 py-3 text-sm rounded-md transition-colors ${selectedProgram?.id === p.id ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' : 'text-slate-600 hover:bg-slate-100 border border-transparent'}`}
            >
              <div className="flex justify-between items-center">
                <span>{p.name}</span>
                {!p.active && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded font-bold">INATIVO</span>}
              </div>
            </button>
          ))}
          {programs.length === 0 && (
            <div className="p-4 text-sm text-slate-500 text-center">Nenhum programa cadastrado.</div>
          )}
        </div>
      </div>

      {/* Main Area - Historico de Valores */}
      <div className="w-2/3 flex flex-col h-full">
        {selectedProgram ? (
          <>
            <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedProgram.name}</h2>
                <p className="text-sm text-slate-500">Histórico de Valores e Reajustes</p>
              </div>
              <RequirePermission permission="SETTINGS_MANAGE">
                <button 
                  onClick={handleNewValue}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Novo Registro
                </button>
              </RequirePermission>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {loadingValues ? (
                <div className="text-center text-slate-500 py-8">Carregando valores...</div>
              ) : values.length > 0 ? (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Vigência</th>
                        <th className="px-4 py-3 font-medium">Per Capita</th>
                        <th className="px-4 py-3 font-medium">Valor Mensal</th>
                        <th className="px-4 py-3 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {values.map(v => (
                        <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-700">
                              {formatDate(v.validFrom)} {v.validTo ? `até ${formatDate(v.validTo)}` : '(Atual)'}
                            </div>
                            {v.publicationDate && (
                              <div className="text-xs text-slate-500">Publicado em: {formatDate(v.publicationDate)}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-800">{formatCurrency(v.perCapitaValue)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-800">{formatCurrency(v.standardMonthlyValue)}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <RequirePermission permission="SETTINGS_MANAGE">
                                <button onClick={() => handleEditValue(v)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Editar">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDeleteRequest(v)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Excluir">
                                  <Trash2 size={16} />
                                </button>
                              </RequirePermission>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-slate-200 border-dashed p-12 text-center">
                  <DollarSign size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 mb-1">Nenhum valor cadastrado</h3>
                  <p className="text-slate-500 text-sm mb-4">Este programa ainda não possui um histórico de valores repassados.</p>
                  <RequirePermission permission="SETTINGS_MANAGE">
                    <button onClick={handleNewValue} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                      <Plus size={16} /> Adicionar o primeiro registro
                    </button>
                  </RequirePermission>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 p-8 text-center">
            Selecione um programa na lista lateral para visualizar e gerenciar seu histórico de valores repassados.
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      {showModal && selectedValue && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                {selectedValue.id ? 'Editar Registro de Valor' : 'Novo Registro de Valor'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Per Capita (R$)</label>
                  <input 
                    type="number" step="0.01" 
                    value={selectedValue.perCapitaValue || ''} 
                    onChange={e => setSelectedValue({...selectedValue, perCapitaValue: e.target.value ? parseFloat(e.target.value) : null})}
                    className="w-full rounded border border-slate-300 px-3 py-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Mensal Padrão (R$)</label>
                  <input 
                    type="number" step="0.01" 
                    value={selectedValue.standardMonthlyValue || ''} 
                    onChange={e => setSelectedValue({...selectedValue, standardMonthlyValue: e.target.value ? parseFloat(e.target.value) : null})}
                    className="w-full rounded border border-slate-300 px-3 py-2" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Válido a partir de *</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input 
                      type="date" required
                      value={selectedValue.validFrom || ''} 
                      onChange={e => setSelectedValue({...selectedValue, validFrom: e.target.value})}
                      className="w-full rounded border border-slate-300 pl-9 pr-3 py-2" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Válido até</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input 
                      type="date" 
                      value={selectedValue.validTo || ''} 
                      onChange={e => setSelectedValue({...selectedValue, validTo: e.target.value})}
                      className="w-full rounded border border-slate-300 pl-9 pr-3 py-2" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidade de Medida</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Refeição, Aluno, Vaga"
                    value={selectedValue.unit || ''} 
                    onChange={e => setSelectedValue({...selectedValue, unit: e.target.value})}
                    className="w-full rounded border border-slate-300 px-3 py-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data da Publicação</label>
                  <input 
                    type="date" 
                    value={selectedValue.publicationDate || ''} 
                    onChange={e => setSelectedValue({...selectedValue, publicationDate: e.target.value})}
                    className="w-full rounded border border-slate-300 px-3 py-2" 
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Observações Gerais</label>
                  <textarea 
                    rows={3}
                    placeholder="Informações sobre reajustes, portarias, etc."
                    value={selectedValue.observation || ''} 
                    onChange={e => setSelectedValue({...selectedValue, observation: e.target.value})}
                    className="w-full rounded border border-slate-300 px-3 py-2" 
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveValue}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
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
        title="Excluir Registro de Valor"
        message="Tem certeza que deseja excluir permanentemente este registro de valor repassado? Esta ação não poderá ser desfeita."
        isDeleting={isDeleting}
      />
    </div>
  );
}
