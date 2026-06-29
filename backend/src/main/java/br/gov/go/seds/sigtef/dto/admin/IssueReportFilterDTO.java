package br.gov.go.seds.sigtef.dto.admin;

import br.gov.go.seds.sigtef.model.IssuePriority;
import br.gov.go.seds.sigtef.model.IssueStatus;
import lombok.Data;

@Data
public class IssueReportFilterDTO {
    private String search; // entity name or agreement number
    private IssueStatus status;
    private IssuePriority priority;
    private Boolean overdue; // true = only overdue issues
}
