package br.gov.go.seds.sigtef.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class ExecutionReportDTO {
    private UUID id;
    private String competence;
    private String entityName;
    private String agreementNumber;
    private String programName;
    private String status;
    private BigDecimal expectedValue;
    private BigDecimal transferredValue;
    private String transferDate;
}
