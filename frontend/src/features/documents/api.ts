import { api } from '../../lib/api';
import type { DocumentResponse, DocumentUploadRequest } from './types';

export const documentService = {
    upload: async (request: DocumentUploadRequest): Promise<DocumentResponse> => {
        const formData = new FormData();
        formData.append('file', request.file);
        if (request.title) formData.append('title', request.title);
        if (request.description) formData.append('description', request.description);
        if (request.documentTypeId) formData.append('documentTypeId', request.documentTypeId);
        if (request.ownerModule) formData.append('ownerModule', request.ownerModule);
        if (request.linkedEntityType) formData.append('linkedEntityType', request.linkedEntityType);
        if (request.linkedEntityId) formData.append('linkedEntityId', request.linkedEntityId);
        if (request.role) formData.append('role', request.role);
        if (request.retentionPolicy) formData.append('retentionPolicy', request.retentionPolicy);

        const response = await api.post<DocumentResponse>('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    replace: async (documentId: string, file: File): Promise<DocumentResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<DocumentResponse>(`/documents/${documentId}/replace`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getByLink: async (entityType: string, entityId: string): Promise<DocumentResponse[]> => {
        const response = await api.get<DocumentResponse[]>('/documents/by-link', {
            params: { entityType, entityId }
        });
        return response.data;
    },

    download: (fileId: string) => {
        // We can just open this URL, or use fetch to get Blob and create object URL
        // Since it's protected by cookies/tokens, if it's cookie based, window.open might work.
        // If we use headers for token, we need to fetch as blob.
        return api.get(`/documents/files/${fileId}/download`, {
            responseType: 'blob'
        }).then(response => {
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            
            // Extract filename from header if possible
            const disposition = response.headers['content-disposition'];
            let filename = 'download';
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) { 
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            a.setAttribute('download', filename);
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
    },

    delete: async (documentId: string): Promise<void> => {
        await api.delete(`/documents/${documentId}`);
    },

    getBlobUrl: async (fileId: string): Promise<string> => {
        const response = await api.get(`/documents/files/${fileId}/download`, {
            responseType: 'blob'
        });
        return window.URL.createObjectURL(new Blob([response.data]));
    }
};
