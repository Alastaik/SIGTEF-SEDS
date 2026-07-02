import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { X, Plus, FileText, Trash2, ChevronDown, ChevronUp, Loader2, Paperclip } from 'lucide-react';
import { accountabilityApi, itemApi } from '../../features/accountability/api';
import type { FiscalDocument, ItemCategory, Item, FiscalDocumentItem, AccountabilityReview } from '../../features/accountability/api';
import type { MonthlyExecution } from '../../features/executions/api';
import { IssueList } from '../../features/accountability/components/issues/IssueList';
import { api } from '../../lib/api';
import { DocumentUploader } from '../../features/documents/components/DocumentUploader';
import { DocumentList } from '../../features/documents/components/DocumentList';
import { ExecutionStatusBadge } from '../../features/executions/components/ExecutionStatusBadge';

interface AccountabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  execution: MonthlyExecution;
  onSuccess: () => void;
}

export function AccountabilityModal({ isOpen, onClose, execution, onSuccess }: AccountabilityModalProps) {
  const [loading, setLoading] = useState(false);
  const [addingDoc, setAddingDoc] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [documents, setDocuments] = useState<FiscalDocument[]>([]);
  const [complementaryDocuments, setComplementaryDocuments] = useState<any[]>([]);
  const [docForm, setDocForm] = useState<FiscalDocument>({
    documentType: 'NF-e',
    value: 0,
    documentNumber: '',
    issuerName: '',
    items: [],
  });

  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [latestReview, setLatestReview] = useState<AccountabilityReview | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Draft tracking (avoid re-starting if already started)
  const draftStarted = useRef(false);

  // Items Data
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, Item[]>>({});

  const requiresItemization = execution.partnershipAgreementProgram?.program?.requiresItemization || false;

  useEffect(() => {
    if (isOpen && requiresItemization) {
      loadCategories();
    }
    if (isOpen && (execution.status === 'PENDING_CORRECTION' || execution.status === 'RESUBMITTED' || execution.status === 'UNDER_REVIEW')) {
      loadSubmission();
      draftStarted.current = true; // Draft already exists for these statuses
    }
    if (isOpen && execution.status === 'PENDING_CORRECTION') {
      loadLatestReview();
    }
    if (!isOpen) {
      // Reset state when closed
      setDocuments([]);
      setErrorMsg(null);
      setLatestReview(null);
      draftStarted.current = false;
    }
  }, [isOpen, requiresItemization, execution.status]);

  const loadLatestReview = async () => {
    try {
      const review = await accountabilityApi.getLatestReview(execution.id);
      setLatestReview(review);
    } catch (error) {
      console.error('Erro ao carregar notas de correção', error);
    }
  };

  const loadSubmission = async () => {
    try {
      const response = await api.get(`/accountabilities/executions/${execution.id}`);
      setSubmission(response.data);
      if (response.data?.fiscalDocuments?.length > 0) {
        setDocuments(response.data.fiscalDocuments);
      } else if (response.data?.accountability?.fiscalDocuments?.length > 0) {
        setDocuments(response.data.accountability.fiscalDocuments);
      }

      if (response.data?.complementaryDocuments?.length > 0) {
        setComplementaryDocuments(response.data.complementaryDocuments);
      } else if (response.data?.accountability?.complementaryDocuments?.length > 0) {
        setComplementaryDocuments(response.data.accountability.complementaryDocuments);
      }
    } catch (error) {
      console.error('Erro ao carregar submissão para pendências', error);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await itemApi.getCategories();
      setCategories(cats);
      const allItems = await itemApi.getAllItems();
      setItemsByCategory(prev => ({ ...prev, '': allItems }));
    } catch (error) {
      console.error('Error loading categories or items', error);
    }
  };

  const loadItems = async (categoryId: string) => {
    if (itemsByCategory[categoryId]) return;
    try {
      const items = await itemApi.getItemsByCategory(categoryId);
      setItemsByCategory(prev => ({ ...prev, [categoryId]: items }));
    } catch (error) {
      console.error('Error loading items', error);
    }
  };

  if (!isOpen) return null;

  // Immediately saves the document to the backend when user clicks "Adicionar"
  const handleAddDocument = async (e: FormEvent) => {
    e.preventDefault();
    setAddingDoc(true);
    setErrorMsg(null);
    try {
      // 1. Ensure draft exists
      if (!draftStarted.current) {
        await accountabilityApi.startDraft(execution.id);
        draftStarted.current = true;
      }

      // 2. Save fiscal document (no temporary id needed — backend returns real id)
      const payload = { ...docForm };
      if (payload.items) {
        payload.items = payload.items.map(item => {
          const itemPayload = { ...item };
          delete itemPayload.id;
          return itemPayload;
        });
      }

      const saved = await accountabilityApi.addFiscalDocument(execution.id, payload);

      // 3. Add to local list with real ID and expand it
      setDocuments(prev => [...prev, saved]);
      setExpandedDoc(saved.id!);

      // Reset form
      setDocForm({ documentType: 'NF-e', value: 0, documentNumber: '', issuerName: '', items: [] });
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || 'Erro ao salvar documento. Tente novamente.');
    } finally {
      setAddingDoc(false);
    }
  };

  const handleRemoveDocument = async (id: string) => {
    try {
      await accountabilityApi.deleteFiscalDocument(id);
      setDocuments(documents.filter(d => d.id !== id));
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || 'Erro ao remover documento. Tente novamente.');
    }
  };

  const totalProven = documents.reduce((acc, curr) => acc + Number(curr.value), 0);
  const expectedValue = execution.transferredValue || 0;
  const difference = expectedValue - totalProven;

  const handlePreSubmit = () => {
    setErrorMsg(null);

    if (documents.length === 0) {
      setErrorMsg('Você precisa adicionar pelo menos um documento para enviar a prestação.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      // The documents were already saved. Just submit.
      await accountabilityApi.submit(execution.id);

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error?.response?.data?.message || 'Ocorreu um erro ao enviar a prestação de contas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl h-[85vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Prestação de Contas</h2>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">Competência: {execution.competence} | Status: <ExecutionStatusBadge status={execution.status} /></p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={24} />
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {errorMsg}
            </div>
          )}

          {execution.status === 'PENDING_CORRECTION' && latestReview && latestReview.comments && (
            <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-md shadow-sm">
              <h3 className="text-orange-800 font-semibold mb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Devolvido para Correção
              </h3>
              <div className="text-orange-900 text-sm whitespace-pre-wrap">
                {latestReview.comments}
              </div>
            </div>
          )}

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar with Summary */}
            <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-200 flex flex-col overflow-y-auto">
              <h3 className="font-medium text-gray-900 mb-4">Resumo Financeiro</h3>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500">Valor Repassado</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expectedValue)}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500">Valor Comprovado</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalProven)}
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${difference === 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                  <div className={`text-sm ${difference === 0 ? 'text-green-700' : 'text-orange-700'}`}>Diferença</div>
                  <div className={`text-xl font-bold ${difference === 0 ? 'text-green-700' : 'text-orange-700'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(difference))}
                  </div>
                </div>
              </div>

              {submission?.accountability?.id && (
                <div className="mt-6">
                  <IssueList accountabilityId={submission.accountability.id} />
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePreSubmit}
                  disabled={loading}
                  className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Enviar Prestação para Análise'
                  )}
                </button>
                {documents.length === 0 && (
                  <p className="text-xs text-gray-400 text-center mt-2">Adicione ao menos um documento para enviar.</p>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-100">

              {/* Form to add new document */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} /> Adicionar Novo Documento Fiscal
                </h3>

                <form onSubmit={handleAddDocument} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                    <select
                      value={docForm.documentType}
                      onChange={e => setDocForm({ ...docForm, documentType: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="NF-e">Nota Fiscal (NF-e)</option>
                      <option value="Recibo">Recibo</option>
                      <option value="Fatura">Fatura de Consumo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor Total (R$)</label>
                    <input
                      type="number" step="0.01" required
                      value={docForm.value || ''}
                      onChange={e => setDocForm({ ...docForm, value: parseFloat(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número do Documento</label>
                    <input
                      type="text" required
                      value={docForm.documentNumber}
                      onChange={e => setDocForm({ ...docForm, documentNumber: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emissor (Fornecedor)</label>
                    <input
                      type="text" required
                      value={docForm.issuerName}
                      onChange={e => setDocForm({ ...docForm, issuerName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={addingDoc}
                      className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
                    >
                      {addingDoc ? (
                        <><Loader2 size={16} className="animate-spin" /> Salvando...</>
                      ) : (
                        <><Plus size={16} /> Adicionar e Anexar Documentos</>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Document Cards */}
              <div className="space-y-4">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id!}
                    doc={doc}
                    isExpanded={expandedDoc === doc.id}
                    onToggle={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id!)}
                    onRemove={() => handleRemoveDocument(doc.id!)}
                    onUpdate={(updated: FiscalDocument) => {
                      setDocuments(documents.map(d => d.id === doc.id ? updated : d));
                    }}
                    requiresItemization={requiresItemization}
                    categories={categories}
                    itemsByCategory={itemsByCategory}
                    setItemsByCategory={setItemsByCategory}
                    onCategorySelect={loadItems}
                    executionId={execution.id}
                    reviewStatus={doc.reviewStatus}
                    reviewComments={doc.reviewComments}
                  />
                ))}
                {documents.length === 0 && (
                  <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                    <FileText className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">Nenhum documento adicionado ainda.</p>
                    <p className="text-xs text-gray-400">Use o formulário acima para adicionar documentos fiscais.</p>
                  </div>
                )}
              </div>

              {/* Complementary Documents Section */}
              <div className="mt-10 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Paperclip size={20} /> Documentos Complementares
                </h3>
                
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-4">
                  <DocumentUploader
                    ownerModule="ACCOUNTABILITY"
                    role="ANEXO_COMPLEMENTAR"
                    label="Adicionar Novo Documento Complementar"
                    description="PDF, JPG ou PNG (Max: 10MB)"
                    onUploadSuccess={async (doc) => {
                      if (doc) {
                        try {
                          if (!draftStarted.current) {
                            await accountabilityApi.startDraft(execution.id);
                            draftStarted.current = true;
                          }
                          await accountabilityApi.addComplementaryDocument(execution.id, doc.id);
                          setComplementaryDocuments(prev => [...prev, doc]);
                        } catch (e: any) {
                          setErrorMsg(e?.response?.data?.message || 'Erro ao vincular documento complementar.');
                        }
                      }
                    }}
                  />
                </div>

                <div className="space-y-3">
                  {complementaryDocuments.map(doc => (
                    <div key={doc.id} className="flex justify-between items-center bg-gray-50 border border-gray-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name || 'Documento Anexado'}</p>
                          {doc.documentType && <p className="text-xs text-gray-500">{doc.documentType.name}</p>}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm('Deseja remover este documento?')) {
                            try {
                              await accountabilityApi.removeComplementaryDocument(execution.id, doc.id);
                              setComplementaryDocuments(prev => prev.filter(d => d.id !== doc.id));
                            } catch (e: any) {
                              setErrorMsg(e?.response?.data?.message || 'Erro ao remover documento.');
                            }
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {complementaryDocuments.length === 0 && (
                    <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-300">
                      <p className="text-sm text-gray-500">Nenhum documento complementar adicionado.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação Final */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Envio</h3>
            
            <div className="space-y-4 mb-6">
              <p className="text-gray-600">
                Você está enviando <strong>{documents.length}</strong> documento(s) fiscal(is).
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Valor Total Comprovado:</span>
                  <span className="font-bold text-blue-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalProven)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Repassado:</span>
                  <span className="font-semibold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expectedValue)}
                  </span>
                </div>
              </div>

              {difference !== 0 && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                  <p className="text-sm text-orange-800 font-medium">Atenção!</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Há uma diferença de <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(difference))}</strong> entre o valor repassado e o comprovado.
                  </p>
                  <p className="text-sm text-orange-700 mt-2">Deseja enviar mesmo com a divergência?</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Revisar Documentos
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Confirmar Envio'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------------------------
// DocumentCard
// ----------------------------------------------------------------------

function DocumentCard({ doc, isExpanded, onToggle, onRemove, onUpdate, requiresItemization, categories, itemsByCategory, setItemsByCategory, onCategorySelect, executionId, reviewStatus, reviewComments }: any) {

  // Item Form State
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [itemSearchName, setItemSearchName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [isCreatingNewItem, setIsCreatingNewItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');

  const [localItems, setLocalItems] = useState<FiscalDocumentItem[]>(doc.items || []);

  // Edit Doc State
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [docForm, setDocForm] = useState({ ...doc });
  const [savingDoc, setSavingDoc] = useState(false);

  const readonly = reviewStatus === 'OK';

  const handleSaveDoc = async () => {
    try {
      setSavingDoc(true);
      const updated = await accountabilityApi.updateFiscalDocument(executionId, doc.id, docForm);
      onUpdate(updated);
      setIsEditingDoc(false);
    } catch (error) {
      console.error('Error updating document', error);
      alert('Erro ao atualizar documento.');
    } finally {
      setSavingDoc(false);
    }
  };

  const handleCatChange = (e: any) => {
    const catId = e.target.value;
    setSelectedCat(catId);
    setSelectedItem('');
    setItemSearchName('');
    setIsCreatingNewItem(false);
    if (catId) {
      onCategorySelect(catId);
    }
  };

  const handleItemChange = (e: any) => {
    const val = e.target.value;
    setItemSearchName(val);
    if (val === '+ Criar Novo Item...') {
      setIsCreatingNewItem(true);
      setSelectedItem('');
      setItemSearchName('');
    } else {
      setIsCreatingNewItem(false);
      const found = itemsByCategory[selectedCat]?.find((i: Item) => `${i.name} (${i.unitOfMeasurement || '-'})` === val);
      if (found) {
        setSelectedItem(found.id);
      } else {
        setSelectedItem('');
      }
    }
  };

  const handleCreateNewItem = async () => {
    try {
      const created = await itemApi.createItem(selectedCat, newItemName, newItemUnit, executionId);
      setItemsByCategory((prev: any) => {
        const catItems = prev[selectedCat] || [];
        const allItems = prev[''] || [];
        return {
          ...prev,
          [selectedCat]: [...catItems, created],
          '': [...allItems, created]
        };
      });
      setSelectedItem(created.id);
      setItemSearchName(`${created.name} (${created.unitOfMeasurement || '-'})`);
      setIsCreatingNewItem(false);
      setNewItemName('');
      setNewItemUnit('');
    } catch (e) {
      console.error('Failed to create item', e);
    }
  };

  const handleAddItem = () => {
    const finalItem = itemsByCategory['']?.find((i: Item) => i.id === selectedItem);
    if (!finalItem || !quantity || !unitPrice) return;

    const newItem: FiscalDocumentItem = {
      id: crypto.randomUUID(),
      item: finalItem,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      totalPrice: Number(quantity) * Number(unitPrice)
    };

    const newItems = [...localItems, newItem];
    setLocalItems(newItems);
    onUpdate({ ...doc, items: newItems });

    setSelectedItem('');
    setItemSearchName('');
    setQuantity('');
    setUnitPrice('');
  };

  const removeLocalItem = (itemId: string) => {
    const newItems = localItems.filter(i => i.id !== itemId);
    setLocalItems(newItems);
    onUpdate({ ...doc, items: newItems });
  };

  const totalItemsValue = localItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${reviewStatus === 'INCORRECT' ? 'border-orange-300' : 'border-gray-200'}`}>
      {/* Header */}
      <div
        className={`px-5 py-4 cursor-pointer transition-colors ${reviewStatus === 'INCORRECT' ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-gray-50'}`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded border ${
              doc.documentType === 'NF-e' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              doc.documentType === 'Recibo' ? 'bg-purple-50 text-purple-700 border-purple-200' :
              'bg-teal-50 text-teal-700 border-teal-200'
            }`}>
              {doc.documentType}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">Nº {doc.documentNumber}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{doc.issuerName}</p>
            </div>
            {reviewStatus === 'OK' && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 border border-green-200 rounded">
                ✓ Aprovado pela SEDS
              </span>
            )}
            {reviewStatus === 'INCORRECT' && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 border border-red-200 rounded">
                ✗ Incorreto — Correção Necessária
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0 ml-4">
            <div className="text-right">
              <span className="block font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doc.value)}
              </span>
              <span className="text-xs text-gray-400">Valor do Documento</span>
            </div>
            {!readonly && (
              <div className="flex gap-1">
                {reviewStatus === 'INCORRECT' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingDoc(true);
                      if (!isExpanded) onToggle();
                    }}
                    className="text-blue-500 hover:text-blue-700 p-1.5 rounded hover:bg-blue-50 transition-colors"
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                  className="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </div>
        </div>
        {reviewStatus === 'INCORRECT' && reviewComments && (
          <div className="mt-3 p-3 bg-white border border-orange-200 rounded-lg" onClick={e => e.stopPropagation()}>
            <p className="text-xs font-semibold text-orange-700 mb-1">Observação da SEDS:</p>
            <p className="text-sm text-orange-800">{reviewComments}</p>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-6 flex flex-col gap-6">

          {isEditingDoc && (
            <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Editar Documento Fiscal</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Tipo de Documento</label>
                  <select
                    value={docForm.documentType}
                    onChange={e => setDocForm({ ...docForm, documentType: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="NF-e">Nota Fiscal (NF-e)</option>
                    <option value="Recibo">Recibo</option>
                    <option value="Fatura">Fatura de Consumo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Valor Total (R$)</label>
                  <input
                    type="number" step="0.01" required
                    value={docForm.value || ''}
                    onChange={e => setDocForm({ ...docForm, value: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Número do Documento</label>
                  <input
                    type="text" required
                    value={docForm.documentNumber}
                    onChange={e => setDocForm({ ...docForm, documentNumber: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Emissor (Fornecedor)</label>
                  <input
                    type="text" required
                    value={docForm.issuerName}
                    onChange={e => setDocForm({ ...docForm, issuerName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingDoc(false)}
                    className="px-3 py-1.5 border border-gray-300 rounded shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDoc}
                    disabled={savingDoc}
                    className="px-3 py-1.5 border border-transparent rounded shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingDoc && <Loader2 size={12} className="animate-spin" />}
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Comprovantes / Upload ── */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Paperclip size={12} /> Comprovantes do Documento Fiscal
            </p>

            {/* Lista de arquivos já enviados */}
            <div className="bg-white rounded-lg border border-gray-200 mb-3 overflow-hidden">
              <DocumentList
                linkedEntityType="FISCAL_DOCUMENT"
                linkedEntityId={doc.id!}
                readonly={readonly}
              />
            </div>

            {/* Área de upload — label inline e compacta */}
            {!readonly && !isEditingDoc && (
              <DocumentUploader
                linkedEntityType="FISCAL_DOCUMENT"
                linkedEntityId={doc.id!}
                ownerModule="ACCOUNTABILITY"
                role="COMPROVANTE"
                retentionPolicy="EXPUNGE_AFTER_5_YEARS"
                label=""
                description="PDF, XML ou imagem (Max 50 MB)"
                acceptedTypes=".pdf,.xml,.jpg,.jpeg,.png"
              />
            )}
          </div>


          {/* ── Itens ── */}
          {requiresItemization && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">Detalhamento de Itens</h4>
                <div className={`text-sm ${totalItemsValue > doc.value ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                  Soma: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalItemsValue)} / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doc.value)}
                </div>
              </div>

              {/* Add Item Form */}
              {!readonly && !isEditingDoc && (
                <div className="bg-white p-4 rounded border border-gray-200 mb-4 shadow-sm">
                  <div className="grid grid-cols-12 gap-3 items-end">

                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Categoria (Opcional)</label>
                      <select
                        value={selectedCat}
                        onChange={handleCatChange}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                      >
                        <option value="">Todas</option>
                        {categories.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Item</label>
                      <input
                        list={`items-list-${doc.id}`}
                        value={itemSearchName}
                        onChange={handleItemChange}
                        placeholder="Pesquisar ou criar novo..."
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                      />
                      <datalist id={`items-list-${doc.id}`}>
                        <option value="+ Criar Novo Item..." />
                        {(itemsByCategory[selectedCat] || itemsByCategory[''] || []).map((i: Item) => (
                          <option key={i.id} value={`${i.name} (${i.unitOfMeasurement || '-'})`} />
                        ))}
                      </datalist>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Qtd</label>
                      <input
                        type="number" step="0.01"
                        value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Preço Unit. (R$)</label>
                      <input
                        type="number" step="0.01"
                        value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                      />
                    </div>

                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        disabled={!selectedItem || !quantity || !unitPrice}
                        className="w-full h-[38px] flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Table */}
              {localItems.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Val. Unit</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        {!readonly && <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {localItems.map((fi, idx) => (
                        <tr key={fi.id || idx}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 flex flex-col">
                            <span>{fi.item.name}</span>
                            <span className="text-xs text-gray-500">{fi.item.category.name} | {fi.item.unitOfMeasurement}</span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{fi.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fi.unitPrice)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fi.totalPrice)}
                          </td>
                          {!readonly && (
                            <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                              <button onClick={() => removeLocalItem(fi.id!)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal para Criar Novo Item */}
      {isCreatingNewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cadastrar Novo Item</h3>
              <button onClick={() => setIsCreatingNewItem(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Selecione a Categoria...</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {!selectedCat && <p className="text-xs text-red-500 mt-1">Obrigatório para novos itens</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Item *</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ex: Arroz Tipo 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidade de Medida</label>
                <input
                  type="text"
                  value={newItemUnit}
                  onChange={e => setNewItemUnit(e.target.value)}
                  className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ex: 5kg, Pacote, Unidade"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsCreatingNewItem(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNewItem}
                disabled={!selectedCat || !newItemName}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Salvar Item
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
