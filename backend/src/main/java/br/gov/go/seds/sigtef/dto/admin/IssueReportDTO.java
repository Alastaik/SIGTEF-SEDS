package br.gov.go.seds.sigtef.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class IssueReportDTO {
    private UUID id;
    private String entityName;
    private String agreementNumber;
    private String competence;
    private String status;
    private String priority;
    private String issueType;
    private String deadline;
    private String resolvedAt;
    private boolean overdue;
    private String description;
}
