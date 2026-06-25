import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import type { IssueReviewDTO, AccountabilityIssueDTO } from '../../types/issue';
import { issueService } from '../../services/issueService';


interface IssueReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    accountabilityId: string;
    issue: AccountabilityIssueDTO | null;
}

export function IssueReviewModal({ isOpen, onClose, accountabilityId, issue }: IssueReviewModalProps) {
    const [reviewNotes, setReviewNotes] = useState('');
    const [isResolved, setIsResolved] = useState(false);
    
    const queryClient = useQueryClient();

    const reviewMutation = useMutation({
        mutationFn: (data: IssueReviewDTO) => {
            const lastResponse = issue?.responses?.[issue.responses.length - 1];
            if (!lastResponse) throw new Error("Sem resposta para avaliar");
            return issueService.reviewResponse(accountabilityId, issue!.id, lastResponse.id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accountability-issues', accountabilityId] });
            alert('Resposta avaliada com sucesso!');
            onClose();
        },
        onError: () => {
            alert('Erro ao avaliar resposta');
        }
    });

    if (!isOpen || !issue) return null;

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        reviewMutation.mutate({
            status: isResolved ? 'ACCEPTED' : 'REJECTED',
            reviewNotes,
            reopenIssue: !isResolved
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">Avaliar Resposta da Entidade</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-4">
                    <div className="bg-gray-50 p-3 rounded text-sm mb-4 border border-gray-200">
                        <p className="font-semibold mb-1">Última Resposta:</p>
                        <p className="italic text-gray-700">"{issue.responses?.[issue.responses.length - 1]?.responseText}"</p>
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <label className="block text-sm font-medium text-gray-700">A pendência foi resolvida?</label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="isResolved" 
                                    checked={isResolved} 
                                    onChange={() => setIsResolved(true)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-900">Sim, aceitar resposta e resolver pendência</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="isResolved" 
                                    checked={!isResolved} 
                                    onChange={() => setIsResolved(false)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-900">Não, reabrir pendência</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1 mt-4">
                        <label className="block text-sm font-medium text-gray-700">Parecer / Motivo (Opcional se aceito, obrigatório se rejeitado)</label>
                        <textarea 
                            rows={3} 
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Descreva o motivo da sua decisão..."
                            required={!isResolved}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t border-gray-200 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={reviewMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
                            {reviewMutation.isPending ? 'Salvando...' : 'Confirmar Avaliação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
