import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Paperclip, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../lib/api';
import { accountabilityApi } from '../../features/accountability/api';
import type { MonthlyExecution } from '../../features/executions/api';
import { IssueList } from '../../features/accountability/components/issues/IssueList';
import { DocumentList } from '../../features/documents/components/DocumentList';

type DocReviewStatus = 'PENDING' | 'OK' | 'INCORRECT';

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
  const [docReviews, setDocReviews] = useState<Record<string, { status: DocReviewStatus, comments: string }>>({});

  useEffect(() => {
    if (isOpen) {
      loadSubmission();
      setComments('');
      setStatus('APPROVED');
    }
  }, [isOpen]);

  const loadSubmission = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/accountabilities/executions/${execution.id}`);
      const data = response.data;
      setSubmission(data);
      
      const initialReviews: Record<string, { status: DocReviewStatus, comments: string }> = {};
      data.fiscalDocuments?.forEach((doc: any) => {
        if (doc.reviewStatus) {
          initialReviews[doc.id] = { status: doc.reviewStatus, comments: doc.reviewComments || '' };
        }
      });
      setDocReviews(initialReviews);
    } catch (error) {
      console.error('Erro ao carregar submissão', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocReview = async (docId: string, reviewStatus: DocReviewStatus, reviewComments: string = '') => {
    const updated = { ...docReviews, [docId]: { status: reviewStatus, comments: reviewComments } };
    setDocReviews(updated);

    try {
      await accountabilityApi.reviewDocument(execution.id, docId, reviewStatus, reviewComments);
    } catch (error) {
      console.error('Erro ao salvar revisão do documento', error);
      alert('Erro ao salvar o status do documento.');
      // Revert in a real scenario, but keeping it simple
    }

    // Auto-fill comments with incorrect docs list
    const incorrectDocs = submission?.fiscalDocuments?.filter(
      (d: any) => updated[d.id]?.status === 'INCORRECT'
    ) ?? [];

    if (incorrectDocs.length > 0) {
      const list = incorrectDocs
        .map((d: any) => `- ${d.documentType} Nº ${d.documentNumber} (${d.issuerName})` + (updated[d.id]?.comments ? `\n  Motivo: ${updated[d.id].comments}` : ''))
        .join('\n');
      setComments(`Os seguintes documentos apresentam pendências que precisam ser corrigidos:\n${list}\n\n`);
      setStatus('PENDING_CORRECTION');
    } else if (comments.startsWith('Os seguintes documentos')) {
      setComments('');
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
  const totalDocs = submission?.fiscalDocuments?.length || 0;
  const reviewedCount = Object.values(docReviews).filter(v => v?.status && v.status !== 'PENDING').length;
  const incorrectCount = Object.values(docReviews).filter(v => v?.status === 'INCORRECT').length;
  const allReviewed = totalDocs > 0 && reviewedCount === totalDocs;
  const hasIncorrect = incorrectCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Análise da Prestação de Contas</h2>
            <p className="text-sm text-gray-500 mt-1">Competência: {execution.competence} • Parceria: {execution.partnershipAgreementProgram?.programName || execution.partnershipAgreementProgram?.id || 'Desconhecida'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Resumo Financeiro */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Valor Repassado (A)</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(execution.expectedValue || 0)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Total Comprovado (B)</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalComprovado)}
                  </div>
                </div>
                <div className={`rounded-xl p-4 border ${diferenca !== 0 ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
                  <div className={`text-sm mb-1 ${diferenca > 0 ? 'text-orange-700' : diferenca < 0 ? 'text-red-700' : 'text-green-700'}`}>
                    Diferença (A - B)
                  </div>
                  <div className={`text-xl font-semibold ${diferenca > 0 ? 'text-orange-900' : diferenca < 0 ? 'text-red-900' : 'text-green-900'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(diferenca))}
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Documentos Comprobatórios</h3>
                  <div className="flex items-center gap-3">
                    {hasIncorrect && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
                        <XCircle size={12} /> {incorrectCount} com problema
                      </span>
                    )}
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {reviewedCount}/{totalDocs} revisado(s)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {totalDocs > 0 && (
                  <div className="mb-4">
                    <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-200">
                      {submission.fiscalDocuments.map((doc: any) => {
                        const r = docReviews[doc.id]?.status ?? 'PENDING';
                        return (
                          <div
                            key={doc.id}
                            className={`flex-1 transition-colors duration-300 ${
                              r === 'OK' ? 'bg-green-500' :
                              r === 'INCORRECT' ? 'bg-red-500' :
                              'bg-gray-200'
                            }`}
                            style={{ marginRight: '2px' }}
                          />
                        );
                      })}
                    </div>
                    {allReviewed && (
                      <p className={`text-xs mt-1.5 font-medium ${hasIncorrect ? 'text-red-600' : 'text-green-600'}`}>
                        {hasIncorrect
                          ? `${incorrectCount} documento(s) marcado(s) com problemas — recomenda-se devolver para correção.`
                          : '✓ Todos os documentos foram revisados e estão corretos.'}
                      </p>
                    )}
                  </div>
                )}

                {!submission?.fiscalDocuments?.length ? (
                  <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span className="text-sm">Nenhum documento fiscal cadastrado.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submission.fiscalDocuments.map((doc: any, index: number) => (
                      <FiscalDocCard
                        key={doc.id || index}
                        doc={doc}
                        index={index}
                        reviewStatus={docReviews[doc.id]?.status ?? 'PENDING'}
                        reviewComments={docReviews[doc.id]?.comments ?? ''}
                        onReview={(s: DocReviewStatus, c?: string) => handleDocReview(doc.id, s, c)}
                      />
                    ))}
                  </div>
                )}
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

// ── FiscalDocCard ─────────────────────────────────────────────────────────────
type DocReviewStatus2 = 'PENDING' | 'OK' | 'INCORRECT';

function FiscalDocCard({ doc, index, reviewStatus, reviewComments, onReview }: {
  doc: any;
  index: number;
  reviewStatus: DocReviewStatus2;
  reviewComments: string;
  onReview: (s: DocReviewStatus2, comments?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [localComments, setLocalComments] = useState(reviewComments || '');
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  // Sync state if prop changes from outside
  useEffect(() => {
    setLocalComments(reviewComments || '');
  }, [reviewComments]);

  const typeColor: Record<string, string> = {
    'NF-e': 'bg-blue-50 text-blue-700 border-blue-200',
    'Recibo': 'bg-purple-50 text-purple-700 border-purple-200',
    'Fatura': 'bg-teal-50 text-teal-700 border-teal-200',
  };
  const badgeClass = typeColor[doc.documentType] || 'bg-gray-100 text-gray-700 border-gray-200';

  const borderClass =
    reviewStatus === 'OK' ? 'border-green-400 shadow-green-100' :
    reviewStatus === 'INCORRECT' ? 'border-red-400 shadow-red-100' :
    'border-gray-200';

  return (
    <div className={`bg-white border-2 rounded-xl shadow-sm overflow-hidden transition-all duration-200 ${borderClass}`}>

      {/* Review bar at top */}
      <div className={`flex flex-col border-b ${
        reviewStatus === 'OK' ? 'bg-green-50 border-green-100' :
        reviewStatus === 'INCORRECT' ? 'bg-red-50 border-red-100' :
        'bg-gray-50 border-gray-100'
      }`}>
        <div className="flex items-center justify-between px-5 py-2">
          <span className={`text-xs font-semibold ${
            reviewStatus === 'OK' ? 'text-green-700' :
            reviewStatus === 'INCORRECT' ? 'text-red-700' :
            'text-gray-500'
          }`}>
            {reviewStatus === 'OK' ? '✓ Documento revisado — Correto' :
             reviewStatus === 'INCORRECT' ? '✗ Documento marcado como incorreto' :
             'Documento pendente de revisão'}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onReview('OK', localComments); }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                reviewStatus === 'OK'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-green-700 border-green-300 hover:bg-green-50'
              }`}
            >
              <CheckCircle size={12} /> Correto
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onReview('INCORRECT', localComments); setExpanded(true); }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                reviewStatus === 'INCORRECT'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-red-700 border-red-300 hover:bg-red-50'
              }`}
            >
              <XCircle size={12} /> Incorreto
            </button>
            {reviewStatus !== 'PENDING' && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLocalComments(''); onReview('PENDING', ''); }}
                className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-white text-gray-500 border-gray-300 hover:bg-gray-50 transition-all"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded border ${badgeClass}`}>
            {doc.documentType}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">Nº {doc.documentNumber}</p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{doc.issuerName}{doc.issuerCnpj ? ` · ${doc.issuerCnpj}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0 ml-4">
          <div className="text-right">
            <p className="font-bold text-gray-900">{fmt(doc.value)}</p>
            {doc.issueDate && (
              <p className="text-xs text-gray-400">
                Emissão: {new Date(doc.issueDate).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </button>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-4">

          {/* Observation Field */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
             <label className="block text-xs font-semibold text-gray-700 mb-1">
               Observação sobre o documento (opcional)
             </label>
             <div className="flex gap-2">
               <input
                 type="text"
                 value={localComments}
                 onChange={(e) => setLocalComments(e.target.value)}
                 placeholder="Ex: Nota fiscal ilegível, CNPJ divergente..."
                 className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                 onBlur={() => {
                   if (localComments !== reviewComments) {
                     onReview(reviewStatus, localComments);
                   }
                 }}
               />
               {localComments !== reviewComments && (
                 <button 
                   type="button" 
                   onClick={() => onReview(reviewStatus, localComments)}
                   className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                 >
                   Salvar
                 </button>
               )}
             </div>
          </div>

          {/* Itens */}
          {doc.items?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Itens Relacionados</p>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qtd</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {doc.items.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.item?.name || 'Item'}</td>
                        <td className="px-4 py-2 text-sm text-gray-500 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">{fmt(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Comprovantes */}
          {doc.id && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Paperclip size={12} /> Comprovantes Anexados
              </p>
              <div className="bg-white rounded-lg border border-gray-200 p-1">
                <DocumentList
                  linkedEntityType="FISCAL_DOCUMENT"
                  linkedEntityId={doc.id}
                  readonly={true}
                />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
