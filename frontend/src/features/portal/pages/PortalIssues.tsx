import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Bell, AlertTriangle, MessageSquare, Send, CheckCircle, Clock } from 'lucide-react';
import { DocumentUploader } from '../../documents/components/DocumentUploader';
import { DocumentList } from '../../documents/components/DocumentList';

export function PortalIssues() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeResponseId, setActiveResponseId] = useState<string | null>(null);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await api.get('/portal/issues');
      setIssues(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar pendências', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">Alta Prioridade</span>;
      case 'MEDIUM':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Média Prioridade</span>;
      case 'LOW':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">Baixa Prioridade</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><AlertTriangle size={12}/> Pendente</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><Clock size={12}/> Em Andamento</span>;
      case 'RESOLVED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><CheckCircle size={12}/> Resolvido</span>;
      case 'CLOSED':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium w-fit">Encerrado</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium w-fit">{status}</span>;
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !responseText.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/portal/issues/${selectedIssue.id}/respond`, { responseText });
      // Salvou a resposta com sucesso, agora exibe o uploader
      setActiveResponseId(res.data.id);
      setResponseText('');
      fetchIssues();
    } catch (error) {
      console.error('Erro ao enviar resposta', error);
      alert('Erro ao enviar resposta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando pendências...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pendências e Notificações</h1>
      
      {issues.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhuma pendência encontrada</h2>
          <p className="text-gray-500">
            Tudo certo por aqui! Você não tem nenhuma pendência de prestação de contas no momento.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className={`md:col-span-1 space-y-4 ${selectedIssue ? 'hidden md:block' : 'block'}`}>
            {issues.map((issue) => (
              <div 
                key={issue.id} 
                onClick={() => {
                  setSelectedIssue(issue);
                  setActiveResponseId(null);
                  setResponseText('');
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedIssue?.id === issue.id 
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  {getStatusBadge(issue.status)}
                  {getPriorityBadge(issue.priority)}
                </div>
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">{issue.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{issue.description}</p>
                <div className="mt-3 text-xs text-gray-400">
                  Data: {new Date(issue.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>

          <div className={`md:col-span-2 ${!selectedIssue ? 'hidden md:flex' : 'flex'} flex-col`}>
            {selectedIssue ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedIssue(null)}
                      className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedIssue.title}</h2>
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(selectedIssue.status)}
                        <span className="text-sm text-gray-500">Criado em {new Date(selectedIssue.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    {getPriorityBadge(selectedIssue.priority)}
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 flex-1 overflow-y-auto bg-gray-50">
                  {/* Descrição Original da SEDS */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                        S
                      </div>
                      <span className="font-semibold text-gray-900">Analista SEDS</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedIssue.description}</p>
                  </div>

                  {/* Histórico de Respostas */}
                  {selectedIssue.responses && selectedIssue.responses.length > 0 && (
                    <div className="space-y-4 mb-6">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Histórico de Interações</h4>
                      {selectedIssue.responses.map((resp: any) => (
                        <div key={resp.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm ml-4 sm:ml-6">
                          <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                                E
                              </div>
                              <span className="font-semibold text-gray-900">Sua Entidade</span>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(resp.createdAt).toLocaleString('pt-BR')}</span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap mb-4">{resp.responseText}</p>
                          
                          <div className="border-t border-gray-100 pt-3">
                            <h5 className="text-xs font-semibold text-gray-500 mb-2">Anexos desta resposta</h5>
                            <DocumentList 
                              linkedEntityType="ACCOUNTABILITY_ISSUE_RESPONSE" 
                              linkedEntityId={resp.id} 
                              readonly={true} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulário de Nova Resposta ou Anexos */}
                  {selectedIssue.status !== 'RESOLVED' && selectedIssue.status !== 'CLOSED' && (
                    <div className="mt-8 border-t border-gray-200 pt-6">
                      {!activeResponseId ? (
                        <form onSubmit={handleSubmitResponse}>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MessageSquare size={18} /> Enviar Justificativa
                          </h4>
                          <textarea
                            required
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Escreva sua resposta ou justificativa aqui..."
                            className="w-full h-32 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm resize-none mb-3"
                          ></textarea>
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={submitting || !responseText.trim()}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center transition-colors disabled:opacity-50"
                            >
                              {submitting ? 'Enviando...' : <><Send size={16} className="mr-2" /> Salvar Resposta</>}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-5">
                          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <CheckCircle size={18} /> Resposta salva com sucesso!
                          </h4>
                          <p className="text-sm text-blue-800 mb-4">
                            Se necessário, você pode anexar documentos complementares (comprovantes, notas fiscais corrigidas) abaixo para enviar junto com sua justificativa.
                          </p>
                          
                          <div className="bg-white p-4 rounded-lg border border-blue-100 mb-4 overflow-hidden">
                            <DocumentUploader
                              linkedEntityType="ACCOUNTABILITY_ISSUE_RESPONSE"
                              linkedEntityId={activeResponseId}
                              ownerModule="ACCOUNTABILITY"
                              role="ANEXO_GERAL"
                              label="Anexar Documento de Justificativa"
                            />
                            
                            <div className="mt-4">
                              <DocumentList 
                                linkedEntityType="ACCOUNTABILITY_ISSUE_RESPONSE" 
                                linkedEntityId={activeResponseId} 
                                readonly={false} 
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setActiveResponseId(null);
                                fetchIssues();
                                // Atualizar a issue selecionada para recarregar as responses
                                const updatedIssue = issues.find(i => i.id === selectedIssue.id);
                                if (updatedIssue) setSelectedIssue(updatedIssue);
                              }}
                              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium"
                            >
                              Concluir Envio
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl h-full flex flex-col items-center justify-center text-gray-400 p-8 min-h-[400px]">
                <MessageSquare size={48} className="mb-4 text-gray-300" />
                <p>Selecione uma pendência na lista ao lado para ver os detalhes e responder.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
