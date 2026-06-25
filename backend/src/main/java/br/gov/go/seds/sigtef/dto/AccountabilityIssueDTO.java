package br.gov.go.seds.sigtef.dto;

import br.gov.go.seds.sigtef.model.IssuePriority;
import br.gov.go.seds.sigtef.model.IssueResponseStatus;
import br.gov.go.seds.sigtef.model.IssueStatus;
import br.gov.go.seds.sigtef.model.IssueType;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class AccountabilityIssueDTO {
    private UUID id;
    private UUID accountabilityId;
    private UserDTO createdBy;
    private LocalDateTime createdAt;
    private IssueType issueType;
    private IssuePriority priority;
    private String description;
    private LocalDate deadline;
    private IssueStatus status;
    private LocalDateTime updatedAt;
    private String cancellationReason;
    private LocalDateTime resolvedAt;
    private List<AccountabilityIssueResponseDTO> responses;
}
