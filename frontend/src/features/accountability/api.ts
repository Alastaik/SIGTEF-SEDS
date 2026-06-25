import { api } from '../../lib/api';

export interface Accountability {
  id: string;
  monthlyExecutionId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'PENDING_CORRECTION' | 'RESUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELED' | 'CLOSED';
  provenValue?: number;
  createdAt: string;
  updatedAt?: string;
  monthlyExecution?: any;
}

export interface FiscalDocument {
  id?: string;
  documentType: string;
  documentNumber?: string;
  accessKey?: string;
  issueDate?: string;
  issuerCnpj?: string;
  issuerName?: string;
  value: number;
  items?: FiscalDocumentItem[];
  attachments?: AccountabilityAttachment[];
}

export interface ItemCategory {
  id: string;
  name: string;
  active: boolean;
}

export interface Item {
  id: string;
  category: ItemCategory;
  name: string;
  unitOfMeasurement?: string;
  createdInAccountabilityId?: string;
  active: boolean;
}

export interface FiscalDocumentItem {
  id?: string;
  item: Item;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AccountabilityAttachment {
  id?: string;
  fileName: string;
  contentType?: string;
  fileSize?: number;
  retentionDate?: string;
}

export const accountabilityApi = {
  startDraft: async (executionId: string): Promise<Accountability> => {
    const response = await api.post(`/accountabilities/start/${executionId}`);
    return response.data;
  },

  addFiscalDocument: async (executionId: string, document: FiscalDocument): Promise<FiscalDocument> => {
    const response = await api.post(`/accountabilities/executions/${executionId}/documents`, document);
    return response.data;
  },

  uploadAttachment: async (submissionId: string | null, fiscalDocumentId: string | null, file: File): Promise<AccountabilityAttachment> => {
    const formData = new FormData();
    formData.append('file', file);
    if (submissionId) formData.append('submissionId', submissionId);
    if (fiscalDocumentId) formData.append('fiscalDocumentId', fiscalDocumentId);

    const response = await api.post('/accountabilities/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  submit: async (executionId: string): Promise<Accountability> => {
    const response = await api.post(`/accountabilities/executions/${executionId}/submit`);
    return response.data;
  },

  analyze: async (executionId: string, status: string, comments: string): Promise<any> => {
    const response = await api.post(`/accountabilities/executions/${executionId}/analyze`, { status, comments });
    return response.data;
  }
};

export const itemApi = {
  getAllItems: async (): Promise<Item[]> => {
    const response = await api.get('/items');
    return response.data;
  },

  getCategories: async (): Promise<ItemCategory[]> => {
    const response = await api.get('/items/categories');
    return response.data;
  },

  getItemsByCategory: async (categoryId: string): Promise<Item[]> => {
    const response = await api.get(`/items/categories/${categoryId}`);
    return response.data;
  },

  createItem: async (categoryId: string, name: string, unitOfMeasurement: string, accountabilityId?: string): Promise<Item> => {
    const response = await api.post('/items', { categoryId, name, unitOfMeasurement, accountabilityId });
    return response.data;
  },

  deleteItem: async (itemId: string, accountabilityId: string): Promise<void> => {
    await api.delete(`/items/${itemId}?accountabilityId=${accountabilityId}`);
  }
};
