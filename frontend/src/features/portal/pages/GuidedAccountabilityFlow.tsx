import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { accountabilityApi, itemApi } from '../../accountability/api';
import type { MonthlyExecution } from '../../executions/api';
import type { FiscalDocument, ItemCategory, Item } from '../../accountability/api';
import { CheckCircle, ChevronRight, ChevronLeft, Save, Play, Plus, FileText, Trash2, Paperclip, AlertCircle } from 'lucide-react';
import { WizardDocumentCard } from '../components/WizardDocumentCard';
import { DocumentUploader } from '../../documents/components/DocumentUploader';
import { DocumentList } from '../../documents/components/DocumentList';

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
  const [savedDocId, setSavedDocId] = useState<string | null>(null);
  const [docForm, setDocForm] = useState<Partial<FiscalDocument>>({
    documentType: 'NF-e',
    documentNumber: '',
    issuerName: '',
    issuerCnpj: '',
    value: 0
  });

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

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!execution) return;
    try {
      setLoading(true);
      const newDoc = await accountabilityApi.addFiscalDocument(execution.id, docForm as any);
      setDocuments(prev => [newDoc, ...prev]);
      setSavedDocId(newDoc.id!); // Muda para a etapa de upload
    } catch (error) {
      console.error('Error adding document', error);
      alert('Erro ao adicionar documento');
    } finally {
      setLoading(false);
    }
  };

  const resetAddForm = () => {
    setAddingDoc(false);
    setSavedDocId(null);
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
                    <div>
                      <div className="mb-4 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Anexar Documento Complementar</h3>
                        <button onClick={resetAddForm} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Relatórios, listas de beneficiados, fotos ou outros documentos requeridos.</p>
                      <DocumentUploader
                        ownerModule="ACCOUNTABILITY"
                        role="ANEXO_COMPLEMENTAR"
                        label="Arraste o arquivo ou clique para selecionar"
                        description="PDF, JPG ou PNG (Max: 10MB)"
                        onUploadSuccess={async (doc) => {
                          if (doc) {
                            await accountabilityApi.addComplementaryDocument(execution.id, doc.id);
                            setComplementaryDocuments(prev => [...prev, doc]);
                            resetAddForm();
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      {!savedDocId ? (
                        <form onSubmit={handleAddDocument}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {docCategory === 'FISCAL' ? 'Nova Nota Fiscal' : 'Outros Documentos / Despesas'}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                            {docCategory === 'FISCAL' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
                                <input
                                  type="number" required min="0.01" step="0.01"
                                  value={docForm.value || ''}
                                  onChange={e => setDocForm({...docForm, value: parseFloat(e.target.value)})}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={resetAddForm} className="px-4 py-2 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                              {loading ? 'Salvando...' : 'Salvar Dados e Anexar PDF'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="animate-fade-in">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center text-green-700">
                              <CheckCircle size={20} className="mr-2" />
                              <h3 className="text-lg font-semibold">Dados salvos com sucesso!</h3>
                            </div>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6 text-sm flex gap-6">
                            <div><span className="text-gray-500 block">Tipo</span><span className="font-medium">{docForm.documentType}</span></div>
                            <div><span className="text-gray-500 block">Número/ID</span><span className="font-medium">{docForm.documentNumber}</span></div>
                            <div><span className="text-gray-500 block">Valor</span><span className="font-medium">R$ {docForm.value}</span></div>
                          </div>
                          <h4 className="text-md font-medium text-gray-800 mb-3">Agora, anexe o arquivo (PDF/Imagem):</h4>
                          <DocumentUploader
                            linkedEntityType="FISCAL_DOCUMENT"
                            linkedEntityId={savedDocId}
                            ownerModule="ACCOUNTABILITY"
                            role={docCategory === 'PAYMENT' ? 'COMPROVANTE' : 'ANEXO_GERAL'}
                            label="Arraste o arquivo ou clique para selecionar"
                            description="PDF, JPG ou PNG (Max: 10MB)"
                            onUploadSuccess={() => {
                              resetAddForm();
                            }}
                          />
                          <div className="mt-4 text-right">
                            <button onClick={resetAddForm} className="text-sm font-medium text-gray-600 hover:text-gray-900">Pular anexo (posso anexar depois)</button>
                          </div>
                        </div>
                      )}
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
                                <p className="text-sm font-medium text-gray-900">{doc.name || 'Documento Anexado'}</p>
                                {doc.documentType && <p className="text-xs text-gray-500">{doc.documentType.name}</p>}
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
