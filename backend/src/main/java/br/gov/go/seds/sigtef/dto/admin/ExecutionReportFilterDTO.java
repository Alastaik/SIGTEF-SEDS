package br.gov.go.seds.sigtef.dto.admin;

import br.gov.go.seds.sigtef.model.MonthlyExecutionStatus;
import lombok.Data;

import java.util.UUID;

@Data
public class ExecutionReportFilterDTO {
    private String search; // entity name or agreement number
    private MonthlyExecutionStatus status;
    private String competence; // YYYY-MM
    private UUID programId;
}
