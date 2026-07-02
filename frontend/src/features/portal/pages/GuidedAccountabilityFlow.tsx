import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { accountabilityApi, itemApi } from '../../accountability/api';
import type { MonthlyExecution } from '../../executions/api';
import type { FiscalDocument, ItemCategory, Item, FiscalDocumentItem } from '../../accountability/api';
import { CheckCircle, ChevronRight, ChevronLeft, Save, Play, Plus, FileText, Trash2, Paperclip, AlertCircle } from 'lucide-react';
import { WizardDocumentCard } from '../components/WizardDocumentCard';
import { DocumentUploader } from '../../documents/components/DocumentUploader';
import { DocumentList } from '../../documents/components/DocumentList';
import { documentService } from '../../documents/api';

export function GuidedAccountabilityFlow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [execution, setExecution] = useState<MonthlyExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<FiscalDocument[]>([]);
  const [complementaryDocuments, setComplementaryDocuments] = useState<any[]>([]);
  
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, Item[]>>({});
  
  // States for adding a new document
  const [addingDoc, setAddingDoc] = useState(false);
  const [docCategory, setDocCategory] = useState<'FISCAL' | 'PAYMENT' | 'COMPLEMENTARY'>('FISCAL');
  
  // Complementary Doc Info
  const [compDocTitle, setCompDocTitle] = useState('');
  const [compDocDescription, setCompDocDescription] = useState('');
  const [savedDocId, setSavedDocId] = useState<string | null>(null);
  const [docForm, setDocForm] = useState<Partial<FiscalDocument>>({
    documentType: 'NF-e',
    documentNumber: '',
    issuerName: '',
    issuerCnpj: '',
    value: 0
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Itemization states for new document
  const [draftItems, setDraftItems] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [itemSearchName, setItemSearchName] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [isCreatingNewItem, setIsCreatingNewItem] = useState(false);

  const draftStarted = useRef(false);

  useEffect(() => {
    const fetchExecution = async () => {
      try {
        const res = await api.get(`/portal/competences/${id}`);
        if (res.data) {
          setExecution(res.data);
          
          if (!draftStarted.current) {
            draftStarted.current = true;
            try {
              await accountabilityApi.startDraft(id!);
            } catch (error: any) {
              if (error.response?.data?.message !== 'Accountability já foi iniciada') {
                console.error("Erro ao iniciar rascunho", error);
              }
            }
            try {
              const [cats, items] = await Promise.all([
                itemApi.getCategories(),
                itemApi.getAllItems()
              ]);
              setCategories(cats);
              const grouped: Record<string, Item[]> = {};
              grouped[''] = items; // Todos os itens
              items.forEach((item: Item) => {
                if (!grouped[item.category.id]) {
                  grouped[item.category.id] = [];
                }
                grouped[item.category.id].push(item);
              });
              setItemsByCategory(grouped);
            } catch (err) {
              console.error("Erro ao carregar itens", err);
            }
            try {
              const subResponse = await api.get(`/accountabilities/executions/${id}`);
              if (subResponse.data?.fiscalDocuments?.length > 0) {
                setDocuments(subResponse.data.fiscalDocuments);
              } else if (subResponse.data?.accountability?.fiscalDocuments?.length > 0) {
                setDocuments(subResponse.data.accountability.fiscalDocuments);
              }

              if (subResponse.data?.complementaryDocuments?.length > 0) {
                setComplementaryDocuments(subResponse.data.complementaryDocuments);
              } else if (subResponse.data?.accountability?.complementaryDocuments?.length > 0) {
                setComplementaryDocuments(subResponse.data.accountability.complementaryDocuments);
              }
            } catch (err) {
              console.error("Nenhuma submissão existente", err);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar competência', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchExecution();
  }, [id]);

  const handleSubmitCompleteDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!execution) return;
    if (docCategory === 'FISCAL') {
      const totalItemsValue = draftItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
      if (totalItemsValue !== docForm.value && draftItems.length > 0) {
        if (!confirm('A soma dos itens não bate com o valor total da nota. Deseja continuar?')) return;
      }
    }
    
    try {
      setLoading(true);
      
      // 1. Criar o documento
      const newDoc = await accountabilityApi.addFiscalDocument(execution.id, docForm as any);
      
      // 2. Se houver itens locais, adiciona ao documento
      let updatedDoc = newDoc;
      if (draftItems.length > 0 && docCategory === 'FISCAL') {
        const docWithItems = { ...newDoc, items: draftItems };
        updatedDoc = await accountabilityApi.updateFiscalDocument(execution.id, newDoc.id!, docWithItems);
      }

      // 3. Se houver arquivo anexado, enviar
      if (selectedFile) {
        await documentService.upload({
          file: selectedFile,
          linkedEntityType: 'FISCAL_DOCUMENT',
          linkedEntityId: newDoc.id,
          ownerModule: 'ACCOUNTABILITY',
          role: docCategory === 'PAYMENT' ? 'COMPROVANTE' : 'ANEXO_GERAL'
        });
      }
      
      // 4. Atualizar interface
      setDocuments(prev => [updatedDoc, ...prev]);
      resetAddForm();
    } catch (error) {
      console.error('Error adding document', error);
      alert('Erro ao salvar documento. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const resetAddForm = () => {
    setAddingDoc(false);
    setSavedDocId(null);
    setSelectedFile(null);
    setDraftItems([]);
    setSelectedItem('');
    setItemSearchName('');
    setQuantity('');
    setUnitPrice('');
    setIsCreatingNewItem(false);
    setDocForm({
      documentType: 'NF-e',
      documentNumber: '',
      issuerName: '',
      issuerCnpj: '',
      value: 0
    });
    setDocCategory('FISCAL');
  };

  const handleCategoryChange = (cat: 'FISCAL' | 'PAYMENT' | 'COMPLEMENTARY') => {
    setDocCategory(cat);
    if (cat === 'FISCAL') {
      setDocForm({ ...docForm, documentType: 'NF-e' });
    } else if (cat === 'PAYMENT') {
      setDocForm({ ...docForm, documentType: 'Comprovante', value: 0 });
    }
  };

  const steps = [
    { number: 1, title: 'Início', desc: 'Dados Gerais' },
    { number: 2, title: 'Documentos e Comprovantes', desc: 'Notas e Pagamentos' },
    { number: 3, title: 'Revisão', desc: 'Conferência Final' },
  ];

  if (loading && !execution) return <div className="p-8 text-center">Carregando...</div>;
  if (!execution) return <div className="p-8 text-center text-red-500">Competência não encontrada.</div>;

  const handleCatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCat(e.target.value);
    setSelectedItem('');
    setItemSearchName('');
  };

  const handleCreateNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat) {
      alert("Selecione uma categoria primeiro");
      return;
    }
    const name = (document.getElementById(`new-item-name-draft`) as HTMLInputElement).value;
    const unit = (document.getElementById(`new-item-unit-draft`) as HTMLInputElement).value;
    try {
      const created = await itemApi.createItem(selectedCat, name, unit, execution?.id);
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
    } catch (err) {
      console.error('Failed to create item', err);
      alert('Erro ao criar novo item.');
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

    setDraftItems([...draftItems, newItem]);
    setSelectedItem('');
    setItemSearchName('');
    setQuantity('');
    setUnitPrice('');
  };

  const removeDraftItem = (itemId: string) => {
    setDraftItems(draftItems.filter(i => i.id !== itemId));
  };

  const isEditable = execution.status === 'READY_FOR_ACCOUNTABILITY' || 
                     execution.status === 'ACCOUNTABILITY_DRAFT' || 
                     execution.status === 'PENDING_CORRECTION';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Prestar Contas</h1>
        <p className="text-gray-500">Competência: {execution.competence} • {execution.partnershipAgreementProgram?.program?.name}</p>
        
        {!isEditable && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0"><CheckCircle className="h-5 w-5 text-red-400" /></div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Esta prestação de contas não pode mais ser editada. Status: <strong>{execution.status === 'ACCOUNTABILITY_CLOSED_UNREALIZED' ? 'Fechada sem Realização' : execution.status}</strong>
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 relative overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[500px] sm:min-w-full">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"></div>
            </div>
            <div className="flex justify-between">
              {steps.map(step => (
                <div key={step.number} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${
                    currentStep > step.number ? 'bg-green-500 text-white' : 
                    currentStep === step.number ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.number ? <CheckCircle size={16} /> : step.number}
                  </div>
                  <span className={`text-xs font-medium ${currentStep === step.number ? 'text-blue-600' : 'text-gray-500'}`}>{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] flex flex-col">
        <div className="p-8 flex-1">
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo à Prestação de Contas</h2>
                <p className="text-gray-600">
                  Você está iniciando o processo de envio para a competência <strong className="text-gray-900">{execution.competence}</strong>.
                  Siga os passos com atenção e tenha em mãos todas as notas fiscais e comprovantes.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-4">Resumo do Mês</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-blue-700">Valor Esperado / Repassado:</span>
                    <span className="font-medium text-blue-900">
                      R$ {execution.expectedValue?.toFixed(2)} {execution.transferredValue ? `/ R$ ${execution.transferredValue.toFixed(2)}` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-blue-700">Prazo para Envio:</span>
                    <span className="font-medium text-blue-900">10º dia útil do mês seguinte</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Documentos e Comprovantes</h2>
                  <p className="text-gray-500 mt-1">Registre as despesas, os comprovantes de pagamento e outros documentos obrigatórios.</p>
                </div>
                {!addingDoc && isEditable && (
                  <button 
                    onClick={() => setAddingDoc(true)}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium inline-flex items-center shadow-sm transition-colors"
                  >
                    <Plus size={18} className="mr-1.5" /> Adicionar Documento
                  </button>
                )}
              </div>

              {addingDoc && (
                <div className="bg-white p-6 border border-blue-200 rounded-xl shadow-sm mb-8 ring-4 ring-blue-50">
                  {!savedDocId && (
                    <div className="mb-6 flex space-x-2 border-b border-gray-200 pb-4">
                      <button
                        onClick={() => handleCategoryChange('FISCAL')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${docCategory === 'FISCAL' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                      >
                        Nota Fiscal
                      </button>
                      <button
                        onClick={() => handleCategoryChange('COMPLEMENTARY')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${docCategory === 'COMPLEMENTARY' ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                      >
                        Documentos Complementares
                      </button>
                      <button
                        onClick={() => handleCategoryChange('PAYMENT')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${docCategory === 'PAYMENT' ? 'bg-purple-100 text-purple-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                      >
                        Outros
                      </button>
                    </div>
                  )}

                  {docCategory === 'COMPLEMENTARY' ? (
                    <div className="animate-fade-in bg-white border border-gray-200 rounded-lg p-5">
                      <div className="mb-4 flex justify-between items-center">
                        <h4 className="text-md font-medium text-gray-800">Anexar Documento Complementar</h4>
                        <button onClick={resetAddForm} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Título do Documento (Obrigatório)</label>
                          <input
                            type="text" required
                            placeholder="Ex: Ofício nº 123/2026"
                            value={compDocTitle}
                            onChange={e => setCompDocTitle(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
                          <textarea
                            placeholder="Explicação breve sobre este documento"
                            value={compDocDescription}
                            onChange={e => setCompDocDescription(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            rows={2}
                          />
                        </div>
                      </div>

                      {compDocTitle ? (
                        <DocumentUploader
                          linkedEntityType="ACCOUNTABILITY"
                          linkedEntityId={execution.id}
                          ownerModule="ACCOUNTABILITY"
                          role="ANEXO_GERAL"
                          docTitle={compDocTitle}
                          docDescription={compDocDescription}
                          onUploadSuccess={async (doc: any) => {
                            try {
                              await accountabilityApi.addComplementaryDocument(execution.id, doc.id);
                              setComplementaryDocuments(prev => [...prev, doc]);
                              resetAddForm();
                              setCompDocTitle('');
                              setCompDocDescription('');
                            } catch (error) {
                              console.error('Erro ao vincular doc complementar', error);
                              alert('Erro ao vincular documento complementar.');
                            }
                          }}
                        />
                      ) : (
                        <div className="p-4 bg-gray-50 border border-gray-200 border-dashed rounded text-sm text-center text-gray-500">
                          Preencha o Título do Documento para liberar o envio do arquivo.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="animate-fade-in bg-white border border-gray-200 rounded-lg p-5">
                      <form onSubmit={handleSubmitCompleteDocument}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {docCategory === 'FISCAL' ? 'Nova Nota Fiscal' : 'Outros Documentos / Despesas'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {docCategory === 'FISCAL' ? (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                                <select
                                  value={docForm.documentType}
                                  onChange={e => setDocForm({...docForm, documentType: e.target.value})}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                >
                                  <option value="NF-e">NF-e (Nota Fiscal Eletrônica)</option>
                                  <option value="NFS-e">NFS-e (Nota Fiscal de Serviços)</option>
                                  <option value="Recibo">Recibo Simples</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Número do Documento</label>
                                <input
                                  type="text" required
                                  value={docForm.documentNumber}
                                  onChange={e => setDocForm({...docForm, documentNumber: e.target.value})}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor / Emissor</label>
                                <input
                                  type="text" required
                                  value={docForm.issuerName}
                                  onChange={e => setDocForm({...docForm, issuerName: e.target.value})}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ do Emissor (Opcional)</label>
                                <input
                                  type="text"
                                  value={docForm.issuerCnpj || ''}
                                  onChange={e => setDocForm({...docForm, issuerCnpj: e.target.value})}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
                                <input
                                  type="number" required min="0.01" step="0.01"
                                  value={docForm.value || ''}
                                  onChange={e => setDocForm({...docForm, value: parseFloat(e.target.value)})}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Identificação / Transação</label>
                                <input
                                  type="text" required placeholder="Ex: Id. PIX, TED"
                                  value={docForm.documentNumber}
                                  onChange={e => setDocForm({...docForm, documentNumber: e.target.value})}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pagador / Conta</label>
                                <input
                                  type="text" required
                                  value={docForm.issuerName}
                                  onChange={e => setDocForm({...docForm, issuerName: e.target.value})}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        {docCategory === 'FISCAL' && (
                          <div className="mb-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-gray-900">Detalhamento de Itens (Opcional)</h4>
                              <div className={`text-sm ${draftItems.reduce((acc, curr) => acc + curr.totalPrice, 0) > (docForm.value || 0) ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                Soma: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(draftItems.reduce((acc, curr) => acc + curr.totalPrice, 0))} / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(docForm.value || 0)}
                              </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4 shadow-sm">
                              {isCreatingNewItem ? (
                                <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4 text-sm">
                                  <p className="font-semibold text-blue-800 mb-2">Cadastrar Novo Item na SEDS</p>
                                  <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                      <label className="block text-xs font-medium text-blue-900">Nome do Item</label>
                                      <input id="new-item-name-draft" required className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"/>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-blue-900">Unidade de Medida</label>
                                      <input id="new-item-unit-draft" required className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"/>
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => { setIsCreatingNewItem(false); setItemSearchName(''); }} className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded">Cancelar</button>
                                    <button type="button" onClick={handleCreateNewItem} className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded">Salvar e Selecionar</button>
                                  </div>
                                </div>
                              ) : null}

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
                                    list="items-list-draft"
                                    value={itemSearchName}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setItemSearchName(val);
                                      const matched = itemsByCategory['']?.find(i => `${i.name} (${i.unitOfMeasurement || '-'})` === val);
                                      if (matched) {
                                        setSelectedItem(matched.id);
                                        setSelectedCat(matched.category.id);
                                      } else {
                                        setSelectedItem('');
                                      }
                                    }}
                                    placeholder="Buscar item..."
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                  />
                                  <datalist id="items-list-draft">
                                    {(selectedCat ? itemsByCategory[selectedCat] : itemsByCategory[''])?.map(item => (
                                      <option key={item.id} value={`${item.name} (${item.unitOfMeasurement || '-'})`} />
                                    ))}
                                  </datalist>
                                  {!selectedItem && itemSearchName.length > 2 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Não encontrou? <button type="button" onClick={() => setIsCreatingNewItem(true)} className="text-blue-600 hover:underline">Criar novo</button>
                                    </p>
                                  )}
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantidade</label>
                                  <input type="number" min="0.01" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm" />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Valor Un. (R$)</label>
                                  <input type="number" min="0.01" step="0.01" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm" />
                                </div>
                                <div className="col-span-1">
                                  <button type="button" onClick={handleAddItem} disabled={!selectedItem || !quantity || !unitPrice} className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center">
                                    <Plus size={18} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {draftItems.length > 0 && (
                              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                      <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                                      <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">Valor Un.</th>
                                      <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                      <th className="px-4 py-2"></th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {draftItems.map(item => (
                                      <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium text-gray-900">{item.item.name}</td>
                                        <td className="px-4 py-2 text-right text-gray-500">{item.quantity}</td>
                                        <td className="px-4 py-2 text-right text-gray-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}</td>
                                        <td className="px-4 py-2 text-right font-medium text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalPrice)}</td>
                                        <td className="px-4 py-2 text-right">
                                          <button type="button" onClick={() => removeDraftItem(item.id)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mb-6 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Arquivo do Documento (Opcional por agora)</h4>
                          <DocumentUploader
                            ownerModule="ACCOUNTABILITY"
                            autoUpload={false}
                            onFileSelect={setSelectedFile}
                            label="Arraste o arquivo ou clique para selecionar"
                            description="PDF, JPG ou PNG (Max: 10MB)"
                          />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                          <button type="button" onClick={resetAddForm} className="px-4 py-2 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
                          <button type="submit" disabled={loading} className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                            {loading ? 'Salvando...' : 'Salvar Documento Completo'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
              
              {documents.length === 0 && complementaryDocuments.length === 0 && !addingDoc ? (
                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum documento registrado</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-6">
                    Clique no botão "Adicionar Documento" para registrar notas fiscais, comprovantes ou anexos complementares.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Despesas */}
                  {documents.filter(d => d.documentType !== 'Comprovante').length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Despesas / Notas Fiscais</h3>
                      <div className="space-y-3">
                        {documents.filter(d => d.documentType !== 'Comprovante').map(doc => (
                          <div key={doc.id} className="relative">
                            <WizardDocumentCard 
                              doc={doc} 
                              executionId={execution.id}
                              categories={categories}
                              itemsByCategory={itemsByCategory}
                              setItemsByCategory={setItemsByCategory}
                              onUpdate={(updated: any) => setDocuments(docs => docs.map(d => d.id === updated.id ? updated : d))}
                              onRemove={(id: string) => setDocuments(docs => docs.filter(d => d.id !== id))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outros / Comprovantes */}
                  {documents.filter(d => d.documentType === 'Comprovante').length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 mt-6">Outros</h3>
                      <div className="space-y-3">
                        {documents.filter(d => d.documentType === 'Comprovante').map(doc => (
                          <div key={doc.id} className="relative">
                            <WizardDocumentCard 
                              doc={doc} 
                              executionId={execution.id}
                              categories={categories}
                              itemsByCategory={itemsByCategory}
                              setItemsByCategory={setItemsByCategory}
                              onUpdate={(updated: any) => setDocuments(docs => docs.map(d => d.id === updated.id ? updated : d))}
                              onRemove={(id: string) => setDocuments(docs => docs.filter(d => d.id !== id))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Complementares */}
                  {complementaryDocuments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 mt-6">Documentos Complementares</h3>
                      <div className="space-y-3">
                        {complementaryDocuments.map(doc => (
                          <div key={doc.id} className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Paperclip size={18} /></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{doc.title || doc.name || 'Documento Anexado'}</p>
                                {doc.description && <p className="text-xs text-gray-500">{doc.description}</p>}
                                {doc.documentType && !doc.description && <p className="text-xs text-gray-500">{doc.documentType.name}</p>}
                              </div>
                            </div>
                            <button
                              onClick={async () => {
                                if (confirm('Deseja remover este documento?')) {
                                  await accountabilityApi.removeComplementaryDocument(execution.id, doc.id);
                                  setComplementaryDocuments(prev => prev.filter(d => d.id !== doc.id));
                                }
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Revisão Final</h2>
              <p className="text-gray-500 mb-6">Confira se os totais batem com o valor repassado. Após o envio, os documentos não poderão ser alterados até que a equipe analise.</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Resumo Financeiro</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Valor Repassado:</span>
                      <span className="font-medium text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(execution.transferredValue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total de Despesas (Notas):</span>
                      <span className="font-medium text-blue-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                          documents.filter(d => d.documentType !== 'Comprovante').reduce((acc, curr) => acc + (curr.value || 0), 0)
                        )}
                      </span>
                    </div>

                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Resumo de Documentos</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Notas Fiscais Inseridas:</span>
                      <span className="font-medium text-gray-900">
                        {documents.filter(d => d.documentType !== 'Comprovante').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Outros Documentos Inseridos:</span>
                      <span className="font-medium text-gray-900">
                        {documents.filter(d => d.documentType === 'Comprovante').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Documentos Complementares:</span>
                      <span className="font-medium text-gray-900">
                        {complementaryDocuments.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer com Botões de Ação */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-xl flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <button 
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1 || loading}
            className={`px-4 py-2 font-medium rounded-lg flex items-center justify-center transition-colors ${currentStep === 1 || loading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
          >
            <ChevronLeft size={16} className="mr-1" /> Voltar
          </button>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex justify-center items-center">
              <Save size={16} className="mr-2" /> Salvar Rascunho
            </button>
            
            <button 
              onClick={async () => {
                if (currentStep < 3) {
                  setCurrentStep(prev => prev + 1);
                } else {
                  if (confirm('Tem certeza que deseja enviar esta prestação de contas para análise?')) {
                    try {
                      setLoading(true);
                      await accountabilityApi.submit(execution.id);
                      alert('Prestação de Contas enviada com sucesso!');
                      navigate('/portal/accountabilities');
                    } catch (error) {
                      console.error('Erro ao enviar', error);
                      alert('Erro ao enviar prestação de contas.');
                    } finally {
                      setLoading(false);
                    }
                  }
                }
              }}
              disabled={loading || !isEditable || (addingDoc && currentStep === 2)}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex justify-center items-center disabled:opacity-50"
            >
              {currentStep === 3 ? 'Confirmar Envio' : 'Próxima Etapa'} 
              {currentStep < 3 && <ChevronRight size={16} className="ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
