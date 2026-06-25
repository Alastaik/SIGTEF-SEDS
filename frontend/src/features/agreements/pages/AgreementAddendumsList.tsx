import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { agreementService } from '../services/agreementService';
import type { Agreement, AgreementAddendum } from '../types';
import { AgreementAddendumModal } from './AgreementAddendumModal';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { formatCurrency } from '../../../utils/formatters';
import { useAuth } from '../../auth/AuthContext';

interface Props {
  agreement: Agreement;
  onUpdate: () => void;
}

export function AgreementAddendumsList({ agreement, onUpdate }: Props) {
  const [addendums, setAddendums] = useState<AgreementAddendum[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddendum, setEditingAddendum] = useState<AgreementAddendum | undefined>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();
  
  const canEdit = user?.authorities?.includes('ROLE_SEDS') || user?.authorities?.includes('ROLE_ADMIN') || false;

  useEffect(() => {
    fetchAddendums();
  }, [agreement.id]);

  const fetchAddendums = async () => {
    try {
      const data = await agreementService.listAddendums(agreement.id);
      setAddendums(data);
    } catch (error) {
      console.error('Failed to fetch addendums', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await agreementService.deleteAddendum(deletingId);
      await fetchAddendums();
    } catch (error) {
      console.error('Failed to delete addendum', error);
      alert('Erro ao excluir aditivo. Verifique se ele já foi aplicado.');
    } finally {
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  const handleApplyAddendum = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja aplicar este aditivo? Isso irá alterar o Termo de Fomento e não poderá ser desfeito.')) {
      return;
    }
    try {
      await agreementService.changeAddendumStatus(id, 'APPLIED');
      await fetchAddendums();
      onUpdate(); // Atualiza o termo pai no layout
    } catch (error) {
      console.error('Failed to apply addendum', error);
      alert('Erro ao aplicar aditivo.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full text-xs font-medium">Rascunho</span>;
      case 'UNDER_REVIEW': return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">Em Análise</span>;
      case 'APPLIED': return <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">Aplicado</span>;
      case 'CANCELED': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Cancelado</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Rejeitado</span>;
      default: return <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PRAZO': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">Prorrogação de Prazo</span>;
      case 'VALOR': return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-xs">Adição de Valor</span>;
      case 'AMBOS': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs">Prazo e Valor</span>;
      case 'OUTROS': return <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-xs">Outros</span>;
      default: return <span>{type}</span>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Carregando aditivos...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Aditivos do Termo</h2>
          <p className="text-sm text-slate-500 mt-1">Gerencie prorrogações de prazo e aditivos de valor deste termo.</p>
        </div>
        {canEdit && (
          <button
            onClick={() => { setEditingAddendum(undefined); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            <span>Novo Aditivo</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {addendums.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <FileText size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-1">Nenhum aditivo encontrado</p>
            <p>Não há registros de aditivos para este termo de fomento.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Novo Fim</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acréscimo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {addendums.map((addendum) => (
                <tr key={addendum.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{addendum.addendumNumber || 'Sem número'}</div>
                    <div className="text-xs text-slate-500">Assinado: {addendum.signatureDate ? new Date(addendum.signatureDate).toLocaleDateString('pt-BR') : '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(addendum.addendumType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(addendum.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {addendum.newEndDate ? new Date(addendum.newEndDate).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 text-right">
                    {addendum.valueAddition ? formatCurrency(addendum.valueAddition) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {(addendum.status === 'DRAFT' || addendum.status === 'UNDER_REVIEW') && canEdit && (
                        <>
                          <button
                            onClick={() => handleApplyAddendum(addendum.id)}
                            title="Aplicar Aditivo"
                            className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 p-1.5 rounded"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => { setEditingAddendum(addendum); setShowModal(true); }}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded"
                            title="Editar Aditivo"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(addendum.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded"
                            title="Excluir Aditivo"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                      {addendum.status === 'APPLIED' && (
                        <button
                          onClick={() => { setEditingAddendum(addendum); setShowModal(true); }}
                          className="text-slate-600 hover:text-slate-900 bg-slate-50 p-1.5 rounded"
                          title="Visualizar Aditivo"
                        >
                          <FileText size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <AgreementAddendumModal
          agreement={agreement}
          addendum={editingAddendum}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchAddendums();
          }}
        />
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        title="Excluir Aditivo"
        message="Tem certeza que deseja excluir este aditivo? Esta ação não pode ser desfeita."
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingId(null);
        }}
      />
    </div>
  );
}
