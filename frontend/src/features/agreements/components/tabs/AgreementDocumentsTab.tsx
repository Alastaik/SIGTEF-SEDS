import { useState } from 'react';
import type { Agreement } from '../../types';
import { DocumentList } from '../../../documents/components/DocumentList';
import { DocumentUploader } from '../../../documents/components/DocumentUploader';
import type { DocumentLinkRole } from '../../../documents/types';
import { Paperclip, Plus, FileText, FilePlus, Folders } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  agreement: Agreement;
  onUpdate?: () => void;
}

interface DocumentSectionProps {
  agreementId: string;
  title: string;
  description: string;
  role: DocumentLinkRole;
  icon: React.ReactNode;
}

function DocumentSection({ agreementId, title, description, role, icon }: DocumentSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleUploadComplete = () => {
    setIsUploading(false);
    queryClient.invalidateQueries({ queryKey: ['documents', 'AGREEMENT', agreementId] });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <button
          onClick={() => setIsUploading(!isUploading)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      <div className="p-6">
        {isUploading && (
          <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-slate-700">Adicionar novo documento</h4>
              <button 
                onClick={() => setIsUploading(false)}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium"
              >
                Cancelar
              </button>
            </div>
            <DocumentUploader
              ownerModule="AGREEMENT"
              linkedEntityType="AGREEMENT"
              linkedEntityId={agreementId}
              role={role}
              onUploadSuccess={handleUploadComplete}
            />
          </div>
        )}

        {/* Note: In a real scenario, the DocumentList might need to be filtered by role. 
            Currently, DocumentList fetches by entityType and entityId.
            We should filter the results locally based on the role to display them in their respective sections. */}
        <DocumentListWithRoleFilter 
            linkedEntityType="AGREEMENT" 
            linkedEntityId={agreementId} 
            role={role} 
        />
      </div>
    </div>
  );
}

// Helper component to filter documents by role from the query
import { useQuery } from '@tanstack/react-query';
import { documentService } from '../../../documents/api';
import { Loader2, AlertCircle, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import React from 'react';

function DocumentListWithRoleFilter({ linkedEntityType, linkedEntityId, role }: { linkedEntityType: string, linkedEntityId: string, role: DocumentLinkRole }) {
    const { data: allDocuments, isLoading, isError, error } = useQuery({
        queryKey: ['documents', linkedEntityType, linkedEntityId],
        queryFn: () => documentService.getByLink(linkedEntityType, linkedEntityId),
        enabled: !!linkedEntityId
    });

    const queryClient = useQueryClient();
    const [previewDoc, setPreviewDoc] = React.useState<{ id: string, name: string, type: string, url: string } | null>(null);
    const [loadingPreview, setLoadingPreview] = React.useState<string | null>(null);

    if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500" /></div>;
    if (isError) return <div className="text-red-500 p-4"><AlertCircle className="inline mr-2" />Erro ao carregar.</div>;

    const documents = allDocuments?.filter(doc => doc.role === role) || [];

    if (documents.length === 0) {
        return <div className="text-sm text-slate-500 italic p-4 text-center bg-slate-50 rounded-lg">Nenhum documento anexado nesta categoria.</div>;
    }

    // Sort documents by uploadedAt descending
    documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    const handleDownload = async (fileId: string) => {
        try {
            await documentService.download(fileId);
        } catch (error) {
            alert('Erro ao fazer download do arquivo.');
        }
    };

    const handleDelete = async (documentId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este documento?')) {
            try {
                await documentService.delete(documentId);
                queryClient.invalidateQueries({ queryKey: ['documents', linkedEntityType, linkedEntityId] });
            } catch (err: any) {
                alert('Erro ao excluir documento.');
            }
        }
    };

    const handlePreview = async (doc: any) => {
        const ext = doc.originalFileName.split('.').pop()?.toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(ext || '');
        const isPdf = ext === 'pdf';

        if (!isImage && !isPdf) {
            handleDownload(doc.fileId);
            return;
        }

        try {
            setLoadingPreview(doc.id);
            const url = await documentService.getBlobUrl(doc.fileId);
            setPreviewDoc({ id: doc.id, name: doc.originalFileName, type: isImage ? 'image' : 'pdf', url });
        } catch (error) {
            alert('Erro ao carregar pré-visualização.');
        } finally {
            setLoadingPreview(null);
        }
    };

    return (
        <>
            <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                {documents.map((doc, index) => (
                    <li key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <button 
                            type="button"
                            onClick={() => handlePreview(doc)}
                            className="flex items-start space-x-3 overflow-hidden text-left flex-1"
                        >
                            <div className="flex-shrink-0 mt-1">
                                {loadingPreview === doc.id ? (
                                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                ) : (
                                    <FileText className="w-5 h-5 text-slate-400" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-slate-900 truncate hover:text-blue-600 transition-colors">
                                        {doc.title || doc.originalFileName}
                                    </p>
                                    {index === 0 && (
                                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-wider">
                                            Atual
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                                    <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                                    <span>•</span>
                                    <span>{format(new Date(doc.uploadedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                                    {doc.description && (
                                        <>
                                            <span>•</span>
                                            <span className="truncate max-w-[200px]" title={doc.description}>{doc.description}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </button>
                        <div className="flex items-center space-x-1 ml-4">
                            <button
                                type="button"
                                onClick={() => handleDownload(doc.fileId)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Download"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Excluir"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Modal de Pré-visualização Inline */}
            {previewDoc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-900 truncate pr-4" title={previewDoc.name}>
                                {previewDoc.name}
                            </h3>
                            <div className="flex gap-2 shrink-0">
                                <a 
                                    href={previewDoc.url} 
                                    download={previewDoc.name}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                                >
                                    <Download size={16} /> Baixar
                                </a>
                                <button
                                    onClick={() => {
                                        URL.revokeObjectURL(previewDoc.url);
                                        setPreviewDoc(null);
                                    }}
                                    className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-4">
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

export function AgreementDocumentsTab({ agreement, onUpdate }: Props) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Paperclip size={20} className="text-blue-600" />
          Documentos do Termo
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie o Plano de Trabalho e outros documentos complementares. Você pode anexar múltiplas versões ao longo do tempo.
        </p>
      </div>

      <DocumentSection
        agreementId={agreement.id}
        title="Plano de Trabalho"
        description="Anexe as versões do plano de trabalho do termo. A mais recente será considerada a atual."
        role="PLANO_DE_TRABALHO"
        icon={<FileText size={20} />}
      />

      <DocumentSection
        agreementId={agreement.id}
        title="Documentos Complementares"
        description="Anexos, ofícios e outros documentos complementares exigidos pelo termo."
        role="DOCUMENTO_COMPLEMENTAR"
        icon={<FilePlus size={20} />}
      />

      <DocumentSection
        agreementId={agreement.id}
        title="Outros Documentos"
        description="Arquivos gerais relacionados ao termo de fomento."
        role="OUTRO_DOCUMENTO"
        icon={<Folders size={20} />}
      />
    </div>
  );
}
