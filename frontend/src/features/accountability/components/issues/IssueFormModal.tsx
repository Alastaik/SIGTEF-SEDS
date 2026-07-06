import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import type { IssueCreateDTO } from '../../types/issue';
import { issueService } from '../../services/issueService';

interface IssueFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    accountabilityId: string;
}

export function IssueFormModal({ isOpen, onClose, accountabilityId }: IssueFormModalProps) {
    const { register, handleSubmit, reset } = useForm<IssueCreateDTO>();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: IssueCreateDTO) => issueService.createIssue(accountabilityId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accountability-issues', accountabilityId] });
            alert('Pendência criada com sucesso!');
            reset();
            onClose();
        },
        onError: () => {
            alert('Erro ao criar pendência');
        }
    });

    const onSubmit = (data: IssueCreateDTO) => {
        createMutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">Nova Pendência</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Tipo de Pendência</label>
                            <select 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                {...register('issueType', { required: true })}
                            >
                                <option value="">Selecione o tipo</option>
                                <option value="DOCUMENT_MISSING">Documento Faltante</option>
                                <option value="DOCUMENT_ILLEGIBLE">Documento Ilegível</option>
                                <option value="INVALID_INVOICE">Nota Fiscal Inválida</option>
                                <option value="VALUE_DIVERGENCE">Divergência de Valores</option>
                                <option value="INVALID_CONSUMER_UNIT">Unidade Consumidora Divergente</option>
                                <option value="WRONG_CATEGORY">Categoria Incorreta</option>
                                <option value="OTHER">Outro</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                            <select 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                {...register('priority', { required: true })}
                            >
                                <option value="">Selecione a prioridade</option>
                                <option value="LOW">Baixa</option>
                                <option value="MEDIUM">Média</option>
                                <option value="HIGH">Alta</option>
                                <option value="CRITICAL">Crítica</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Prazo de Correção</label>
                        <input 
                            type="date" 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            {...register('deadline', { required: true })} 
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Descrição Detalhada</label>
                        <textarea 
                            rows={4} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Descreva o problema encontrado e o que a entidade deve fazer..." 
                            {...register('description', { required: true })} 
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t border-gray-200 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
                            {createMutation.isPending ? 'Salvando...' : 'Salvar Pendência'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
