import React, { useState, useRef } from 'react';
import { UploadCloud, File as FileIcon, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../api';
import type { DocumentOwnerModule, DocumentLinkRole, RetentionPolicy } from '../types';

interface DocumentUploaderProps {
    linkedEntityType: string;
    linkedEntityId: string;
    ownerModule: DocumentOwnerModule;
    role?: DocumentLinkRole;
    retentionPolicy?: RetentionPolicy;
    documentTypeId?: string;
    label?: string;
    description?: string;
    acceptedTypes?: string;
    maxSizeMB?: number;
    onUploadSuccess?: () => void;
}

export function DocumentUploader({
    linkedEntityType,
    linkedEntityId,
    ownerModule,
    role = 'ANEXO_GERAL',
    retentionPolicy = 'EXPUNGE_AFTER_90_DAYS',
    documentTypeId,
    label = 'Anexar Documento',
    description = 'Arraste e solte ou clique para selecionar',
    acceptedTypes = '*/*',
    maxSizeMB = 50,
    onUploadSuccess
}: DocumentUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const uploadMutation = useMutation({
        mutationFn: (selectedFile: File) => documentService.upload({
            file: selectedFile,
            linkedEntityType,
            linkedEntityId,
            ownerModule,
            role,
            retentionPolicy,
            documentTypeId
        }),
        onSuccess: () => {
            setFile(null);
            queryClient.invalidateQueries({ queryKey: ['documents', linkedEntityType, linkedEntityId] });
            if (onUploadSuccess) onUploadSuccess();
        },
        onError: (err: any) => {
            alert('Erro ao enviar documento: ' + (err.response?.data?.message || err.message));
            setFile(null);
        }
    });

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (selectedFile: File) => {
        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            alert(`O arquivo excede o limite de ${maxSizeMB}MB.`);
            return;
        }
        setFile(selectedFile);
        uploadMutation.mutate(selectedFile);
    };

    const onButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div 
                className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors
                    ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
                    ${uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={uploadMutation.isPending ? undefined : onButtonClick}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={acceptedTypes}
                    onChange={handleChange}
                    disabled={uploadMutation.isPending}
                />
                
                {uploadMutation.isPending ? (
                    <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <span className="text-sm text-gray-500">Enviando documento...</span>
                    </div>
                ) : file ? (
                    <div className="flex items-center space-x-2 text-blue-600">
                        <FileIcon className="w-6 h-6" />
                        <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-2 text-gray-500">
                        <UploadCloud className="w-8 h-8 text-gray-400" />
                        <div className="text-sm font-medium">
                            <span className="text-blue-600">Clique para fazer upload</span> ou arraste e solte
                        </div>
                        <p className="text-xs text-gray-400">{description}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
