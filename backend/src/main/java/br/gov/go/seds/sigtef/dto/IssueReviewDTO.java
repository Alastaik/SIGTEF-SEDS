package br.gov.go.seds.sigtef.dto;

import br.gov.go.seds.sigtef.model.IssueResponseStatus;
import lombok.Data;

@Data
public class IssueReviewDTO {
    private IssueResponseStatus status; // ACCEPTED or REJECTED
    private String reviewNotes;
    private Boolean reopenIssue; // If rejected, does SEDS want to reopen the issue?
}
