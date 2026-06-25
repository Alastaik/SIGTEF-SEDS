package br.gov.go.seds.sigtef.dto;

import br.gov.go.seds.sigtef.model.IssuePriority;
import br.gov.go.seds.sigtef.model.IssueType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class IssueCreateDTO {
    private IssueType issueType;
    private IssuePriority priority;
    private String description;
    private LocalDate deadline;
}
