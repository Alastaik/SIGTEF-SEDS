export type DocumentOwnerModule = 'ACCOUNTABILITY' | 'AGREEMENT' | 'ISSUE' | 'ENTITY' | 'GENERAL';
export type RetentionPolicy = 'DO_NOT_EXPUNGE' | 'EXPUNGE_AFTER_90_DAYS' | 'EXPUNGE_AFTER_5_YEARS' | 'FISCAL_XML_10_YEARS';
export type DocumentLinkRole = 'COMPROVANTE' | 'TERMO_ASSINADO' | 'ADITIVO' | 'RESPOSTA_PENDENCIA' | 'PARECER' | 'ANEXO_GERAL' | 'ANEXO_COMPLEMENTAR' | 'PLANO_DE_TRABALHO' | 'DOCUMENTO_COMPLEMENTAR' | 'OUTRO_DOCUMENTO';

export interface DocumentResponse {
    id: string;
    title: string;
    description?: string;
    documentTypeId?: string;
    documentTypeName?: string;
    ownerModule: DocumentOwnerModule;
    createdAt: string;
    createdById: string;
    
    fileId: string;
    originalFileName: string;
    mimeType: string;
    fileSize: number;
    sha256Hash: string;
    versionNumber: number;
    retentionPolicy: RetentionPolicy;
    uploadedAt: string;
    
    linkId?: string;
    linkedEntityType?: string;
    linkedEntityId?: string;
    role?: DocumentLinkRole;
}

export interface DocumentUploadRequest {
    file: File;
    title?: string;
    description?: string;
    documentTypeId?: string;
    ownerModule?: DocumentOwnerModule;
    linkedEntityType?: string;
    linkedEntityId?: string;
    role?: DocumentLinkRole;
    retentionPolicy?: RetentionPolicy;
}
