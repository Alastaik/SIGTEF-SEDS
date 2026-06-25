import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AccountabilityIssueDTO } from '../../types/issue';
import { issueService } from '../../services/issueService';
import { IssueFormModal } from './IssueFormModal';
import { IssueReviewModal } from './IssueReviewModal';
import { EntityIssueResponseModal } from '../../../portal/components/EntityIssueResponseModal';
import { useAuth } from '../../../auth/AuthContext';

interface IssueListProps {
    accountabilityId: string;
}

export function IssueList({ accountabilityId }: IssueListProps) {
    const { data: issues, isLoading } = useQuery({
        queryKey: ['accountability-issues', accountabilityId],
        queryFn: () => issueService.getIssues(accountabilityId)
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [reviewIssue, setReviewIssue] = useState<AccountabilityIssueDTO | null>(null);
    const [respondIssue, setRespondIssue] = useState<AccountabilityIssueDTO | null>(null);
    
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const isSeds = user?.authorities?.includes('ROLE_SEDS');
    const isEntity = user?.authorities?.includes('ROLE_ENTIDADE');

    const notifyMutation = useMutation({
        mutationFn: () => issueService.notifyIssues(accountabilityId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accountability-issues', accountabilityId] });
            alert('Entidade notificada das pendências com sucesso!');
        }
    });

    if (isLoading) return <div>Carregando pendências...</div>;

    const hasOpenIssues = issues?.some(i => i.status === 'OPEN');

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Pendências da Prestação</h3>
                <div className="space-x-2">
                    {hasOpenIssues && isSeds && (
                        <button 
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                            onClick={() => notifyMutation.mutate()}
                            disabled={notifyMutation.isPending}
                        >
                            Notificar Entidade
                        </button>
                    )}
                    {isSeds && <button className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm font-medium" onClick={() => setIsFormOpen(true)}>Nova Pendência</button>}
                </div>
            </div>

            {issues?.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-md border text-gray-500">
                    Nenhuma pendência encontrada.
                </div>
            ) : (
                <div className="space-y-3">
                    {issues?.map(issue => (
                        <div key={issue.id} className={`border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden ${issue.status === 'RESOLVED' ? 'opacity-70' : ''}`}>
                            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div className="flex items-center space-x-2">
                                    <h4 className="text-sm font-semibold text-gray-900">{issue.issueType}</h4>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${issue.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-800'}`}>
                                        {issue.priority}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">{issue.status}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    Prazo: {new Date(issue.deadline).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="px-4 py-3 text-sm text-gray-700">
                                <p>{issue.description}</p>

                                {issue.responses && issue.responses.length > 0 && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                                        <p className="font-semibold text-xs mb-1">Última Resposta (V{issue.responses.length})</p>
                                        <p className="text-xs text-gray-600 italic">
                                            "{issue.responses[issue.responses.length - 1].responseText}"
                                        </p>
                                        
                                        {issue.status === 'ANSWERED' && isSeds && (
                                            <button 
                                                className="mt-2 text-xs border border-gray-300 text-gray-700 bg-white px-3 py-1.5 rounded hover:bg-gray-50 font-medium"
                                                onClick={() => setReviewIssue(issue)}
                                            >
                                                Avaliar Resposta
                                            </button>
                                        )}
                                    </div>
                                )}

                                {((issue.status === 'NOTIFIED' || issue.status === 'REOPENED') && isEntity) && (
                                    <div className="mt-3">
                                        <button 
                                            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium"
                                            onClick={() => setRespondIssue(issue)}
                                        >
                                            Responder Pendência
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isSeds && (
                <>
                    <IssueFormModal 
                        isOpen={isFormOpen} 
                        onClose={() => setIsFormOpen(false)} 
                        accountabilityId={accountabilityId} 
                    />

                    <IssueReviewModal
                        isOpen={!!reviewIssue}
                        onClose={() => setReviewIssue(null)}
                        accountabilityId={accountabilityId}
                        issue={reviewIssue}
                    />
                </>
            )}

            {isEntity && (
                <EntityIssueResponseModal
                    isOpen={!!respondIssue}
                    onClose={() => setRespondIssue(null)}
                    accountabilityId={accountabilityId}
                    issue={respondIssue}
                />
            )}
        </div>
    );
}
