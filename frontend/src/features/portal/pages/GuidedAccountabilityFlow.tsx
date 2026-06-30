import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { accountabilityApi } from '../../accountability/api';
import type { MonthlyExecution } from '../../executions/api';
import type { FiscalDocument } from '../../accountability/api';
import { CheckCircle, ChevronRight, ChevronLeft, ArrowRight, Save, Play, Plus, FileText, Paperclip, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
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
  const [addingDoc, setAddingDoc] = useState(false);
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
        const response = await api.get(`/monthly-executions`); // Aqui não temos um get by id pronto para o portal, mas podemos pegar todos e filtrar ou o backend poderia ter um.
        // Vamos usar a API padrão para pegar a execution
        const responseList = await api.get(`/monthly-executions?competence=&legalEntityId=&programId=&status=`); 
        // Na verdade a paginação pode atrapalhar. Melhor usar a API /accountabilities/executions/:id pra ver a submissão, e uma api específica pra pegar a execution.
        // Ou usar o accountabilityApi.startDraft direto que já retorna algo?
        
        // Simulação de busca
        const res = await api.get(`/monthly-executions`);
        const found = res.data.content.find((e: any) => e.id === id);
        if (found) {
          setExecution(found);
          
          if (!draftStarted.current) {
            draftStarted.current = true;
            try {
              await accountabilityApi.startDraft(id!);
            } catch (error: any) {
              if (error.response?.data?.message !== 'Accountability já foi iniciada') {
                console.error("Erro ao iniciar rascunho", error);
              }
            }
            // Buscar submissão para pegar documentos já salvos
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
      setLoading(true); // Reusing loading state for the button could be bad, but let's just make it simple
      const newDoc = await accountabilityApi.addFiscalDocument(execution.id, docForm as any);
      setDocuments(prev => [newDoc, ...prev]);
      setAddingDoc(false);
      setDocForm({
        documentType: 'NF-e',
        documentNumber: '',
        issuerName: '',
        issuerCnpj: '',
        value: 0
      });
    } catch (error) {
      console.error('Error adding document', error);
      alert('Erro ao adicionar documento');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Início', desc: 'Dados Gerais' },
    { number: 2, title: 'Notas Fiscais', desc: 'Registro de Despesas' },
    { number: 3, title: 'Anexos', desc: 'Arquivos em PDF' },
    { number: 4, title: 'Pagamentos', desc: 'Comprovantes' },
    { number: 5, title: 'Complementares', desc: 'Outros Documentos' },
    { number: 6, title: 'Revisão', desc: 'Conferência Final' },
  ];

  if (loading) return <div className="p-8 text-center">Iniciando prestação de contas...</div>;
  if (!execution) return <div className="p-8 text-center text-red-500">Competência não encontrada.</div>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header e Progressão */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Prestar Contas</h1>
        <p className="text-gray-500">Competência: {execution.competence} • {execution.partnershipAgreementProgram?.program?.name}</p>
        
        <div className="mt-8 relative">
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

      {/* Área de Conteúdo do Step */}
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
                  <h2 className="text-xl font-bold text-gray-900">Notas Fiscais e Despesas</h2>
                  <p className="text-gray-500 mt-1">Registre todas as despesas incorridas nesta competência. O sistema calculará o total automaticamente.</p>
                </div>
                <button 
                  onClick={() => setAddingDoc(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium inline-flex items-center shadow-sm transition-colors"
                >
                  <Plus size={18} className="mr-1.5" /> Adicionar Nota
                </button>
              </div>

              {addingDoc && (
                <div className="bg-white p-6 border border-blue-200 rounded-xl shadow-sm mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Nota Fiscal</h3>
                  <form onSubmit={handleAddDocument}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
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
                          type="text"
                          required
                          value={docForm.documentNumber}
                          onChange={e => setDocForm({...docForm, documentNumber: e.target.value})}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor / Emissor</label>
                        <input
                          type="text"
                          required
                          value={docForm.issuerName}
                          onChange={e => setDocForm({...docForm, issuerName: e.target.value})}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ do Emissor</label>
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
                          type="number"
                          required
                          min="0.01"
                          step="0.01"
                          value={docForm.value || ''}
                          onChange={e => setDocForm({...docForm, value: parseFloat(e.target.value)})}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        type="button" 
                        onClick={() => setAddingDoc(false)}
                        className="px-4 py-2 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        Salvar Nota Fiscal
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {documents.length === 0 && !addingDoc ? (
                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma nota fiscal registrada</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-6">
                    Clique no botão acima para começar a adicionar as despesas desta competência.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map(doc => (
                    <WizardDocumentCard 
                      key={doc.id} 
                      doc={doc} 
                      executionId={execution.id} 
                      onUpdate={(updated: any) => {
                        setDocuments(docs => docs.map(d => d.id === updated.id ? updated : d));
                      }}
                      onRemove={(id: string) => {
                        setDocuments(docs => docs.filter(d => d.id !== id));
                      }}
                    />
                  ))}
                  
                  <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center border border-blue-100 mt-6">
                    <span className="font-medium text-blue-900">Total de Despesas Registradas</span>
                    <span className="text-xl font-bold text-blue-700">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        documents.reduce((acc, curr) => acc + (curr.value || 0), 0)
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Anexos das Notas</h2>
              <p className="text-gray-500 mb-6">Faça o upload do arquivo PDF correspondente a cada nota fiscal registrada na etapa anterior.</p>
              
              {documents.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-12 text-center text-gray-500">
                  <p>Nenhuma nota fiscal registrada. Volte e adicione uma nota fiscal primeiro.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {documents.filter(d => d.documentType !== 'Comprovante').map(doc => (
                    <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{doc.documentType} Nº {doc.documentNumber}</p>
                          <p className="text-sm text-gray-500">{doc.issuerName}</p>
                        </div>
                        <span className="font-bold text-blue-700">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doc.value)}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <Paperclip size={16} className="mr-1.5" /> Arquivos Anexados
                          </h4>
                          <DocumentList 
                            linkedEntityType="FISCAL_DOCUMENT" 
                            linkedEntityId={doc.id!} 
                            readonly={false} 
                          />
                        </div>
                        <div className="border-l border-gray-100 pl-6">
                          <DocumentUploader
                            linkedEntityType="FISCAL_DOCUMENT"
                            linkedEntityId={doc.id!}
                            ownerModule="ACCOUNTABILITY"
                            role="ANEXO_GERAL"
                            label="Anexar Arquivo"
                            description="PDF, JPG ou PNG (Max: 10MB)"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Comprovantes de Pagamento</h2>
              <p className="text-gray-500 mb-6">Anexe os comprovantes bancários (transferências, PIX, boletos) que comprovem o pagamento das despesas.</p>
              
              <div className="mb-6">
                 <button 
                  onClick={() => {
                    setDocForm({ ...docForm, documentType: 'Comprovante' });
                    setAddingDoc(true);
                  }}
                  className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-medium inline-flex items-center shadow-sm transition-colors"
                >
                  <Plus size={18} className="mr-1.5" /> Adicionar Comprovante
                </button>
              </div>

              {addingDoc && docForm.documentType === 'Comprovante' && (
                <div className="bg-white p-6 border border-purple-200 rounded-xl shadow-sm mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Comprovante</h3>
                  <form onSubmit={handleAddDocument}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Identificação / Transação</label>
                        <input
                          type="text"
                          required
                          value={docForm.documentNumber}
                          onChange={e => setDocForm({...docForm, documentNumber: e.target.value})}
                          placeholder="Ex: Id. Transferência, PIX"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pagador (Entidade)</label>
                        <input
                          type="text"
                          required
                          value={docForm.issuerName}
                          onChange={e => setDocForm({...docForm, issuerName: e.target.value})}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Comprovante (R$)</label>
                        <input
                          type="number"
                          required
                          min="0.01"
                          step="0.01"
                          value={docForm.value || ''}
                          onChange={e => setDocForm({...docForm, value: parseFloat(e.target.value)})}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        type="button" 
                        onClick={() => setAddingDoc(false)}
                        className="px-4 py-2 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                      >
                        Salvar Comprovante
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {documents.filter(d => d.documentType === 'Comprovante').length === 0 && (!addingDoc || docForm.documentType !== 'Comprovante') ? (
                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-12 text-center text-gray-500">
                  <p>Nenhum comprovante de pagamento registrado.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.filter(d => d.documentType === 'Comprovante').map(doc => (
                    <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <div className="flex items-center gap-3">
                          <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded border bg-purple-50 text-purple-700 border-purple-200">
                            Comprovante
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">{doc.documentNumber}</p>
                            <p className="text-sm text-gray-500">{doc.issuerName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doc.value)}
                          </span>
                          <button
                            onClick={() => setDocuments(docs => docs.filter(d => d.id !== doc.id))}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <DocumentList 
                            linkedEntityType="FISCAL_DOCUMENT" 
                            linkedEntityId={doc.id!} 
                            readonly={false} 
                          />
                        </div>
                        <div className="border-l border-gray-100 pl-6">
                          <DocumentUploader
                            linkedEntityType="FISCAL_DOCUMENT"
                            linkedEntityId={doc.id!}
                            ownerModule="ACCOUNTABILITY"
                            role="COMPROVANTE"
                            label="Anexar Comprovante (PDF/Imagem)"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Documentos Complementares</h2>
              <p className="text-gray-500 mb-6">Anexe arquivos obrigatórios que não possuem dados financeiros, como Lista de Beneficiados, Fotos ou Relatórios de Atividades.</p>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
                <DocumentUploader
                  ownerModule="ACCOUNTABILITY"
                  role="ANEXO_COMPLEMENTAR"
                  label="Adicionar Documento Complementar"
                  description="PDF, JPG ou PNG (Max: 10MB)"
                  onUploadSuccess={async (doc) => {
                    if (doc) {
                      await accountabilityApi.addComplementaryDocument(execution.id, doc.id);
                      setComplementaryDocuments(prev => [...prev, doc]);
                    }
                  }}
                />
              </div>

              {complementaryDocuments.length > 0 ? (
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
                            await accountabilityApi.removeComplementaryDocument(execution.id, doc.id);
                            setComplementaryDocuments(prev => prev.filter(d => d.id !== doc.id));
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-8 text-center text-gray-500">
                  <p>Nenhum documento complementar adicionado.</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Revisão Final</h2>
              <p className="text-gray-500 mb-6">Confira se os totais batem com o valor repassado. Após o envio, os documentos não poderão ser alterados até que a SEDS analise.</p>
              
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
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total de Pagamentos:</span>
                      <span className="font-medium text-purple-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                          documents.filter(d => d.documentType === 'Comprovante').reduce((acc, curr) => acc + (curr.value || 0), 0)
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
                      <span className="text-gray-500">Comprovantes Inseridos:</span>
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
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-xl flex justify-between items-center">
          <button 
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1 || loading}
            className={`px-4 py-2 font-medium rounded-lg inline-flex items-center transition-colors ${currentStep === 1 || loading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
          >
            <ChevronLeft size={16} className="mr-1" /> Voltar
          </button>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 inline-flex items-center">
              <Save size={16} className="mr-2" /> Salvar Rascunho
            </button>
            
            <button 
              onClick={async () => {
                if (currentStep < 6) {
                  setCurrentStep(prev => prev + 1);
                } else {
                  if (confirm('Tem certeza que deseja enviar esta prestação de contas para a SEDS?')) {
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
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center disabled:opacity-50"
            >
              {currentStep === 6 ? 'Confirmar Envio' : 'Próxima Etapa'} 
              {currentStep < 6 && <ChevronRight size={16} className="ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
