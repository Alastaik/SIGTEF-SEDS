export type IssueType = 
    | 'DOCUMENT_MISSING' 
    | 'DOCUMENT_ILLEGIBLE' 
    | 'INVALID_INVOICE' 
    | 'VALUE_DIVERGENCE' 
    | 'INVALID_CONSUMER_UNIT' 
    | 'WRONG_CATEGORY' 
    | 'OTHER';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IssueStatus = 
    | 'OPEN' 
    | 'NOTIFIED' 
    | 'ANSWERED' 
    | 'UNDER_REVIEW' 
    | 'RESOLVED' 
    | 'REJECTED_RESPONSE' 
    | 'EXPIRED' 
    | 'REOPENED' 
    | 'CANCELED';

export type IssueResponseStatus = 
    | 'SUBMITTED' 
    | 'UNDER_REVIEW' 
    | 'ACCEPTED' 
    | 'REJECTED' 
    | 'CANCELED';

export interface UserDTO {
    id: string;
    name: string;
    email: string;
}

export interface AccountabilityIssueAttachmentDTO {
    id: string;
    fileName: string;
    fileUrl: string;
    contentType: string;
    fileSize: number;
    uploadedAt: string;
}

export interface AccountabilityIssueResponseDTO {
    id: string;
    issueId: string;
    versionNumber: number;
    submittedBy: UserDTO;
    submittedAt: string;
    responseText: string;
    status: IssueResponseStatus;
    reviewedBy?: UserDTO;
    reviewedAt?: string;
    reviewNotes?: string;
    attachments: AccountabilityIssueAttachmentDTO[];
}

export interface AccountabilityIssueDTO {
    id: string;
    accountabilityId: string;
    createdBy: UserDTO;
    createdAt: string;
    issueType: IssueType;
    priority: IssuePriority;
    description: string;
    deadline: string;
    status: IssueStatus;
    updatedAt: string;
    cancellationReason?: string;
    resolvedAt?: string;
    responses: AccountabilityIssueResponseDTO[];
}

export interface IssueCreateDTO {
    issueType: IssueType;
    priority: IssuePriority;
    description: string;
    deadline: string;
}

export interface IssueResponseCreateDTO {
    responseText: string;
}

export interface IssueReviewDTO {
    status: IssueResponseStatus;
    reviewNotes: string;
    reopenIssue: boolean;
}
