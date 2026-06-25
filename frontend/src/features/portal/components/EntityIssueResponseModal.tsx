import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import type { IssueResponseCreateDTO, AccountabilityIssueDTO } from '../../accountability/types/issue';
import { issueService } from '../../accountability/services/issueService';

interface EntityIssueResponseModalProps {
    isOpen: boolean;
    onClose: () => void;
    accountabilityId: string;
    issue: AccountabilityIssueDTO | null;
}

export function EntityIssueResponseModal({ isOpen, onClose, accountabilityId, issue }: EntityIssueResponseModalProps) {
    const { register, handleSubmit, reset } = useForm<IssueResponseCreateDTO>();
    const queryClient = useQueryClient();

    const respondMutation = useMutation({
        mutationFn: (data: IssueResponseCreateDTO) => issueService.submitResponse(accountabilityId, issue!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accountability-issues', accountabilityId] });
            alert('Resposta enviada com sucesso!');
            reset();
            onClose();
        },
        onError: () => {
            alert('Erro ao enviar resposta');
        }
    });

    const onSubmit = (data: IssueResponseCreateDTO) => {
        respondMutation.mutate(data);
    };

    if (!isOpen || !issue) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">Responder Pendência</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4">
                    
                    <div className="bg-orange-50 p-4 rounded text-sm mb-4 border border-orange-200">
                        <p className="font-semibold text-orange-900 mb-1">Motivo da Pendência:</p>
                        <p className="text-orange-800">{issue.description}</p>
                        <p className="text-xs text-orange-600 mt-2">Prazo: {new Date(issue.deadline).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Sua Resposta / Justificativa</label>
                        <textarea 
                            rows={5} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Descreva a correção realizada ou a justificativa..." 
                            {...register('responseText', { required: true })} 
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t border-gray-200 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={respondMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
                            {respondMutation.isPending ? 'Enviando...' : 'Enviar Resposta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
