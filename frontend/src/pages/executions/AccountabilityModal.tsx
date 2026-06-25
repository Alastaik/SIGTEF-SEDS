import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { X, Upload, Plus, FileText, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { accountabilityApi, itemApi } from '../../features/accountability/api';
import type { FiscalDocument, ItemCategory, Item, FiscalDocumentItem } from '../../features/accountability/api';
import type { MonthlyExecution } from '../../features/executions/api';
import { IssueList } from '../../features/accountability/components/issues/IssueList';
import { api } from '../../lib/api';

interface AccountabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  execution: MonthlyExecution;
  onSuccess: () => void;
}

export function AccountabilityModal({ isOpen, onClose, execution, onSuccess }: AccountabilityModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [documents, setDocuments] = useState<FiscalDocument[]>([]);
  const [docForm, setDocForm] = useState<FiscalDocument>({
    documentType: 'NF-e',
    value: 0,
    documentNumber: '',
    issuerName: '',
    items: [],
    attachments: []
  });

  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [submission, setSubmission] = useState<any>(null);

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
    }
  }, [isOpen, requiresItemization, execution.status]);

  const loadSubmission = async () => {
    try {
      const response = await api.get(`/executions/${execution.id}`);
      setSubmission(response.data);
    } catch (error) {
      console.error('Erro ao carregar submissão para pendências', error);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await itemApi.getCategories();
      setCategories(cats);
      // Load all items by default for when no category is selected
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

  const handleAddDocument = (e: FormEvent) => {
    e.preventDefault();
    const newDoc = { ...docForm, id: crypto.randomUUID() };
    setDocuments([...documents, newDoc]);
    setDocForm({ documentType: 'NF-e', value: 0, documentNumber: '', issuerName: '', items: [], attachments: [] });
    setExpandedDoc(newDoc.id);
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  const handleSubmit = async () => {
    try {
      setErrorMsg(null);
      
      // Validações
      if (documents.length === 0) {
        setErrorMsg("Você precisa adicionar pelo menos um documento para enviar a prestação.");
        return;
      }
      
      if (requiresItemization) {
        for (const doc of documents) {
          if (!doc.items || doc.items.length === 0) {
            setErrorMsg(`O documento nº ${doc.documentNumber} não possui itens detalhados. Como o programa exige detalhamento, todos os documentos devem ter itens.`);
            return;
          }
        }
      }
      
      if (difference < 0) {
        setErrorMsg("O valor comprovado é maior do que o valor repassado. Por favor, verifique os documentos.");
        return;
      }

      setLoading(true);
      
      // 1. Iniciar Rascunho (Cria a Accountability e Submission)
      await accountabilityApi.startDraft(execution.id);
      
      // 2. Salvar todos os documentos
      for (const doc of documents) {
        // Remove IDs temporários para o backend gerar novos
        const payload = { ...doc };
        delete payload.id;
        if (payload.items) {
          payload.items = payload.items.map(item => {
            const itemPayload = { ...item };
            delete itemPayload.id;
            return itemPayload;
          });
        }
        
        // Envia o documento para o backend usando o executionId
        await accountabilityApi.addFiscalDocument(execution.id, payload);
      }
      
      // 3. Submeter Prestação
      await accountabilityApi.submit(execution.id);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error?.response?.data?.message || "Ocorreu um erro ao enviar a prestação de contas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const totalProven = documents.reduce((acc, curr) => acc + Number(curr.value), 0);
  const expectedValue = execution.transferredValue || 0;
  const difference = expectedValue - totalProven;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl h-[85vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Prestação de Contas</h2>
              <p className="text-sm text-gray-500 mt-1">Competência: {execution.competence} | Status: {execution.status}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={24} />
            </button>
          </div>
          
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {errorMsg}
                  </p>
                </div>
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
                  onClick={handleSubmit}
                  disabled={loading || documents.length === 0}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Prestação para Análise'}
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} /> Adicionar Novo Documento
                </h3>
                
                <form onSubmit={handleAddDocument} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                    <select 
                      value={docForm.documentType}
                      onChange={e => setDocForm({...docForm, documentType: e.target.value})}
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
                      onChange={e => setDocForm({...docForm, value: parseFloat(e.target.value)})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número do Documento</label>
                    <input 
                      type="text" required
                      value={docForm.documentNumber}
                      onChange={e => setDocForm({...docForm, documentNumber: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emissor (Fornecedor)</label>
                    <input 
                      type="text" required
                      value={docForm.issuerName}
                      onChange={e => setDocForm({...docForm, issuerName: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800">
                      <Plus size={16} /> Salvar Cabeçalho e Continuar
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-4">
                {documents.map((doc) => (
                  <DocumentCard 
                    key={doc.id!} 
                    doc={doc} 
                    isExpanded={expandedDoc === doc.id}
                    onToggle={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id!)}
                    onRemove={() => handleRemoveDocument(doc.id!)}
                    onUpdate={(updated: any) => {
                      setDocuments(documents.map(d => d.id === doc.id ? updated : d));
                    }}
                    requiresItemization={requiresItemization}
                    categories={categories}
                    itemsByCategory={itemsByCategory}
                    setItemsByCategory={setItemsByCategory}
                    onCategorySelect={loadItems}
                    executionId={execution.id}
                  />
                ))}
                {documents.length === 0 && (
                  <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                    <FileText className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">Nenhum documento adicionado ainda.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Subcomponents
// ----------------------------------------------------------------------

function DocumentCard({ doc, isExpanded, onToggle, onRemove, onUpdate, requiresItemization, categories, itemsByCategory, setItemsByCategory, onCategorySelect, executionId }: any) {
  
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
  const [localAttachments, setLocalAttachments] = useState<any[]>(doc.attachments || []);
  const [uploading, setUploading] = useState(false);

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
      console.error("Failed to create item", e);
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
    
    // Reset form
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newAttachments = [...localAttachments];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Upload immediately, we pass null for submissionId and fiscalDocumentId because we don't have them yet
        // The backend will save the attachment and return it.
        const uploaded = await accountabilityApi.uploadAttachment(null, null, file);
        newAttachments.push(uploaded);
      }
      setLocalAttachments(newAttachments);
      onUpdate({ ...doc, attachments: newAttachments });
    } catch (error) {
      console.error("Failed to upload attachment", error);
      alert("Falha ao fazer upload do arquivo. Tente novamente.");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeAttachment = (attId: string) => {
    const newAtts = localAttachments.filter(a => a.id !== attId);
    setLocalAttachments(newAtts);
    onUpdate({ ...doc, attachments: newAtts });
  };

  const totalItemsValue = localItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div 
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{doc.documentType} Nº {doc.documentNumber}</span>
          <span className="text-sm text-gray-500">{doc.issuerName}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block text-sm text-gray-500">Valor do Documento</span>
            <span className="font-bold text-gray-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doc.value)}
            </span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="text-red-500 hover:text-red-700 p-2"
          >
            <Trash2 size={18} />
          </button>
          {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-6 flex flex-col gap-6">
          
          {/* Anexos Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Upload size={16} /> Anexar Arquivos ao Documento
            </h4>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-white cursor-pointer transition-colors bg-gray-50 group">
              <input 
                type="file" 
                multiple 
                onChange={handleFileUpload} 
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              />
              <span className="block text-sm font-medium text-gray-700 group-hover:text-blue-600">
                {uploading ? 'Enviando arquivos...' : 'Clique ou arraste a NF-e e comprovantes de pagamento aqui'}
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                PDF, XML, JPG (Max 50MB)
              </span>
            </div>
            
            {localAttachments.length > 0 && (
              <ul className="mt-4 border border-gray-200 rounded-md divide-y divide-gray-200">
                {localAttachments.map(att => (
                  <li key={att.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <FileText className="flex-shrink-0 h-5 w-5 text-gray-400" />
                      <span className="ml-2 flex-1 w-0 truncate">{att.fileName}</span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button 
                        type="button" 
                        onClick={() => removeAttachment(att.id)}
                        className="font-medium text-red-600 hover:text-red-500"
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Itens Section */}
          {requiresItemization && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  Detalhamento de Itens
                </h4>
                <div className={`text-sm ${totalItemsValue > doc.value ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                  Soma dos Itens: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalItemsValue)} / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doc.value)}
                </div>
              </div>

              {/* Add Item Form */}
              <div className="bg-white p-4 rounded border border-gray-200 mb-4 shadow-sm">
                <div className="grid grid-cols-12 gap-3 items-end">
                  
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Categoria (Opcional)</label>
                    <select 
                      value={selectedCat} 
                      onChange={handleCatChange}
                      className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Todas as Categorias</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-medium text-gray-700">Item (Pesquise ou Selecione)</label>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsCreatingNewItem(true);
                            setNewItemName('');
                            setNewItemUnit('');
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-1 rounded"
                        >
                          + Novo Item
                        </button>
                      </div>
                      <input 
                        list={`items-list-${doc.id}`}
                        value={itemSearchName} 
                        onChange={handleItemChange}
                        placeholder="Pesquisar..."
                        className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <datalist id={`items-list-${doc.id}`}>
                        {itemsByCategory[selectedCat]?.map((i: Item) => (
                          <option key={i.id} value={`${i.name} (${i.unitOfMeasurement || '-'})`} />
                        ))}
                      </datalist>
                    </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Qtd</label>
                    <input 
                      type="number" step="0.01"
                      value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                      className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Preço Unit. (R$)</label>
                    <input 
                      type="number" step="0.01"
                      value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))}
                      className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
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
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
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
                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => removeLocalItem(fi.id!)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                          </td>
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
