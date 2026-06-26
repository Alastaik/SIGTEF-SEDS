import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Download, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { documentService } from '../api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface DocumentListProps {
    linkedEntityType: string;
    linkedEntityId: string;
    readonly?: boolean;
}

export function DocumentList({ linkedEntityType, linkedEntityId, readonly = false }: DocumentListProps) {
    const queryClient = useQueryClient();

    const { data: documents, isLoading, isError, error } = useQuery({
        queryKey: ['documents', linkedEntityType, linkedEntityId],
        queryFn: () => documentService.getByLink(linkedEntityType, linkedEntityId),
        enabled: !!linkedEntityId
    });

    const deleteMutation = useMutation({
        mutationFn: (documentId: string) => documentService.delete(documentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', linkedEntityType, linkedEntityId] });
        },
        onError: (err: any) => {
            alert('Erro ao excluir documento: ' + (err.response?.data?.message || err.message));
        }
    });

    const handleDownload = async (fileId: string, originalFileName: string) => {
        try {
            await documentService.download(fileId);
        } catch (error) {
            console.error('Download failed', error);
            alert('Erro ao fazer download do arquivo.');
        }
    };

    const handleDelete = (documentId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este documento?')) {
            deleteMutation.mutate(documentId);
        }
    };

    const [previewDoc, setPreviewDoc] = React.useState<{ id: string, name: string, type: string, url: string } | null>(null);
    const [loadingPreview, setLoadingPreview] = React.useState<string | null>(null);

    const handlePreview = async (doc: any) => {
        const ext = doc.originalFileName.split('.').pop()?.toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(ext || '');
        const isPdf = ext === 'pdf';

        if (!isImage && !isPdf) {
            // If not supported, just download
            handleDownload(doc.fileId, doc.originalFileName);
            return;
        }

        try {
            setLoadingPreview(doc.id);
            const url = await documentService.getBlobUrl(doc.fileId);
            setPreviewDoc({ id: doc.id, name: doc.originalFileName, type: isImage ? 'image' : 'pdf', url });
        } catch (error) {
            console.error('Failed to load preview', error);
            alert('Erro ao carregar pré-visualização.');
        } finally {
            setLoadingPreview(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Carregando documentos...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center p-4 text-red-500 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">Erro ao carregar documentos. {(error as any)?.response?.data?.message || (error as any)?.message || 'Erro desconhecido'}</span>
            </div>
        );
    }

    if (!documents || documents.length === 0) {
        return (
            <div className="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">
                Nenhum documento anexado.
            </div>
        );
    }

    return (
        <>
            <ul className="divide-y divide-gray-200 border rounded-lg overflow-hidden bg-white">
                {documents.map((doc) => (
                    <li key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <button 
                            type="button"
                            onClick={() => handlePreview(doc)}
                            className="flex items-start space-x-3 overflow-hidden text-left flex-1"
                        >
                            <div className="flex-shrink-0 mt-1">
                                {loadingPreview === doc.id ? (
                                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                ) : (
                                    <FileText className="w-6 h-6 text-gray-400" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
                                    {doc.title || doc.originalFileName}
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                    <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                                    <span>•</span>
                                    <span>
                                        {format(new Date(doc.uploadedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                    </span>
                                    {doc.role && (
                                        <>
                                            <span>•</span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                {doc.role}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </button>
                        <div className="flex items-center space-x-2 ml-4">
                            <button
                                type="button"
                                onClick={() => handleDownload(doc.fileId, doc.originalFileName)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Download"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            {!readonly && (
                                <button
                                    type="button"
                                    onClick={() => handleDelete(doc.id)}
                                    disabled={deleteMutation.isPending}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                    title="Excluir"
                                >
                                    {deleteMutation.isPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {/* Modal de Pré-visualização Inline */}
            {previewDoc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 truncate pr-4" title={previewDoc.name}>
                                {previewDoc.name}
                            </h3>
                            <div className="flex gap-2 shrink-0">
                                <a 
                                    href={previewDoc.url} 
                                    download={previewDoc.name}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                                >
                                    <Download size={16} /> Baixar Original
                                </a>
                                <button
                                    onClick={() => {
                                        URL.revokeObjectURL(previewDoc.url);
                                        setPreviewDoc(null);
                                    }}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-4">
                            {previewDoc.type === 'image' ? (
                                <img 
                                    src={previewDoc.url} 
                                    alt={previewDoc.name}
                                    className="max-w-full max-h-full object-contain shadow-sm"
                                />
                            ) : (
                                <iframe 
                                    src={previewDoc.url}
                                    className="w-full h-full bg-white rounded shadow-sm border-0"
                                    title={previewDoc.name}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
