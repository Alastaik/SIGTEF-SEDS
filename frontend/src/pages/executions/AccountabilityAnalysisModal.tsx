import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Download, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { accountabilityApi } from '../../features/accountability/api';
import type { MonthlyExecution } from '../../features/executions/api';
import type { FiscalDocument } from '../../features/accountability/api';
import { IssueList } from '../../features/accountability/components/issues/IssueList';

interface AccountabilityAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  execution: MonthlyExecution;
  onSuccess: () => void;
}

export function AccountabilityAnalysisModal({ isOpen, onClose, execution, onSuccess }: AccountabilityAnalysisModalProps) {
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [status, setStatus] = useState<'APPROVED' | 'REJECTED' | 'PENDING_CORRECTION'>('APPROVED');
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSubmission();
    }
  }, [isOpen]);

  const loadSubmission = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/executions/${execution.id}`);
      setSubmission(response.data);
    } catch (error) {
      console.error('Erro ao carregar submissão', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if ((status === 'REJECTED' || status === 'PENDING_CORRECTION') && !comments.trim()) {
      alert('É obrigatório preencher a justificativa para reprovar ou devolver a prestação.');
      return;
    }

    setAnalyzing(true);
    try {
      await accountabilityApi.analyze(execution.id, status, comments);
      alert('Análise salva com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar análise', error);
      alert('Erro ao salvar análise.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const totalComprovado = submission?.fiscalDocuments?.reduce((acc: number, doc: any) => acc + doc.value, 0) || 0;
  const diferenca = execution.expectedValue - totalComprovado;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Análise da Prestação de Contas</h2>
            <p className="text-sm text-gray-500 mt-1">
              {execution.partnershipAgreementProgram?.partnershipAgreement?.legalEntity?.tradeName} - {execution.competence}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Carregando dados da prestação...</div>
          ) : (
            <>
              {/* Resumo */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Valor Repassado</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(execution.expectedValue)}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-sm text-blue-600 mb-1">Valor Comprovado</div>
                  <div className="text-xl font-semibold text-blue-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalComprovado)}
                  </div>
                </div>
                <div className={`p-4 rounded-lg border ${diferenca > 0 ? 'bg-orange-50 border-orange-100' : diferenca < 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                  <div className={`text-sm mb-1 ${diferenca > 0 ? 'text-orange-600' : diferenca < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Diferença
                  </div>
                  <div className={`text-xl font-semibold ${diferenca > 0 ? 'text-orange-900' : diferenca < 0 ? 'text-red-900' : 'text-green-900'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(diferenca))}
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Documentos Comprobatórios</h3>
                <div className="space-y-4">
                  {submission?.fiscalDocuments?.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                      Nenhum documento anexado.
                    </div>
                  )}
                  {submission?.fiscalDocuments?.map((doc: any, index: number) => (
                    <div key={doc.id || index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{doc.documentType} - {doc.documentNumber}</h4>
                          <p className="text-sm text-gray-500 mt-1">Fornecedor: {doc.issuerName} ({doc.issuerCnpj})</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doc.value)}
                          </div>
                          <div className="text-sm text-gray-500">Emissão: {new Date(doc.issueDate).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {doc.items && doc.items.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Itens Relacionados:</h5>
                          <ul className="space-y-1">
                            {doc.items.map((item: any, i: number) => (
                              <li key={i} className="text-sm text-gray-600 flex justify-between">
                                <span>{item.quantity}x {item.item?.name || 'Item'}</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalValue)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {doc.attachments && doc.attachments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                          {doc.attachments.map((att: any, i: number) => (
                            <a
                              key={i}
                              href={`http://localhost:8081/files/${att.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            >
                              <Download size={14} />
                              {att.originalFileName}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulário de Análise */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Parecer Técnico</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus('APPROVED')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        status === 'APPROVED'
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-200 hover:bg-green-50/50 text-gray-600'
                      }`}
                    >
                      <CheckCircle size={20} className={status === 'APPROVED' ? 'text-green-600' : 'text-gray-400'} />
                      <span className="font-medium">Aprovar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus('PENDING_CORRECTION')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        status === 'PENDING_CORRECTION'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50/50 text-gray-600'
                      }`}
                    >
                      <AlertCircle size={20} className={status === 'PENDING_CORRECTION' ? 'text-orange-500' : 'text-gray-400'} />
                      <span className="font-medium">Devolver p/ Correção</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus('REJECTED')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        status === 'REJECTED'
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-red-200 hover:bg-red-50/50 text-gray-600'
                      }`}
                    >
                      <XCircle size={20} className={status === 'REJECTED' ? 'text-red-600' : 'text-gray-400'} />
                      <span className="font-medium">Reprovar</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Justificativa / Parecer {(status === 'REJECTED' || status === 'PENDING_CORRECTION') && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descreva o motivo da aprovação, rejeição ou os itens que precisam ser corrigidos..."
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
            disabled={analyzing}
          >
            Cancelar
          </button>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || loading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {analyzing ? 'Salvando...' : 'Salvar Parecer'}
          </button>
        </div>
      </div>
    </div>
  );
}
