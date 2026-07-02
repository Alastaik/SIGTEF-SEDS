import { api } from '../../lib/api';

export interface Accountability {
  id: string;
  monthlyExecutionId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'PENDING_CORRECTION' | 'RESUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELED' | 'CLOSED' | 'CLOSED_UNREALIZED';
  provenValue?: number;
  createdAt: string;
  updatedAt?: string;
  monthlyExecution?: any;
}

export interface AccountabilityReview {
  id: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'PENDING_CORRECTION' | 'RESUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELED' | 'CLOSED' | 'CLOSED_UNREALIZED';
  comments?: string;
  reviewedAt: string;
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
  reviewStatus?: string;
  reviewComments?: string;
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



export const accountabilityApi = {
  startDraft: async (executionId: string): Promise<Accountability> => {
    const response = await api.post(`/accountabilities/start/${executionId}`);
    return response.data;
  },

  addFiscalDocument: async (executionId: string, document: FiscalDocument): Promise<FiscalDocument> => {
    const response = await api.post(`/accountabilities/executions/${executionId}/documents`, document);
    return response.data;
  },

  updateFiscalDocument: async (executionId: string, documentId: string, document: FiscalDocument): Promise<FiscalDocument> => {
    const response = await api.put(`/accountabilities/executions/${executionId}/documents/${documentId}`, document);
    return response.data;
  },

  deleteFiscalDocument: async (executionId: string, documentId: string): Promise<void> => {
    await api.delete(`/accountabilities/executions/${executionId}/documents/${documentId}`);
  },

  submit: async (executionId: string): Promise<Accountability> => {
    const response = await api.post(`/accountabilities/executions/${executionId}/submit`);
    return response.data;
  },

  addComplementaryDocument: async (executionId: string, documentId: string): Promise<void> => {
    await api.post(`/accountabilities/executions/${executionId}/complementary-documents/${documentId}`);
  },

  removeComplementaryDocument: async (executionId: string, documentId: string): Promise<void> => {
    await api.delete(`/accountabilities/executions/${executionId}/complementary-documents/${documentId}`);
  },

  getLatestReview: async (executionId: string): Promise<AccountabilityReview | null> => {
    const response = await api.get(`/accountabilities/executions/${executionId}/latest-review`);
    return response.data || null;
  },

  analyze: async (executionId: string, status: string, comments: string): Promise<any> => {
    const response = await api.post(`/accountabilities/executions/${executionId}/analyze`, { status, comments });
    return response.data;
  },

  reviewDocument: async (executionId: string, documentId: string, status: string, comments: string): Promise<FiscalDocument> => {
    const response = await api.put(`/accountabilities/executions/${executionId}/documents/${documentId}/review`, { status, comments });
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
