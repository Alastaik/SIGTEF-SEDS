import { api } from '../../../lib/api';
import type { 
    AccountabilityIssueDTO, 
    IssueCreateDTO, 
    IssueResponseCreateDTO, 
    IssueReviewDTO 
} from '../types/issue';

export const issueService = {
    getIssues: async (accountabilityId: string): Promise<AccountabilityIssueDTO[]> => {
        const response = await api.get(`/accountabilities/${accountabilityId}/issues`);
        return response.data;
    },

    createIssue: async (accountabilityId: string, data: IssueCreateDTO): Promise<AccountabilityIssueDTO> => {
        const response = await api.post(`/accountabilities/${accountabilityId}/issues`, data);
        return response.data;
    },

    notifyIssues: async (accountabilityId: string): Promise<void> => {
        await api.post(`/accountabilities/${accountabilityId}/issues/notify`);
    },

    cancelIssue: async (accountabilityId: string, issueId: string, reason: string): Promise<AccountabilityIssueDTO> => {
        const response = await api.post(`/accountabilities/${accountabilityId}/issues/${issueId}/cancel`, { reason });
        return response.data;
    },

    submitResponse: async (accountabilityId: string, issueId: string, data: IssueResponseCreateDTO): Promise<AccountabilityIssueDTO> => {
        const response = await api.post(`/accountabilities/${accountabilityId}/issues/${issueId}/responses`, data);
        return response.data;
    },

    reviewResponse: async (accountabilityId: string, issueId: string, responseId: string, data: IssueReviewDTO): Promise<AccountabilityIssueDTO> => {
        const response = await api.post(`/accountabilities/${accountabilityId}/issues/${issueId}/responses/${responseId}/review`, data);
        return response.data;
    }
};
