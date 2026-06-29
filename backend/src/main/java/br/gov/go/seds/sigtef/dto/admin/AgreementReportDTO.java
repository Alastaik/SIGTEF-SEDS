package br.gov.go.seds.sigtef.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class AgreementReportDTO {
    private UUID id;
    private String agreementNumber;
    private String entityName;
    private String entityCnpj;
    private String status;
    private List<String> programs;
    private LocalDate startDate;
    private LocalDate endDate;
    private long daysRemaining;         // negativo = vencido
    private BigDecimal globalValue;
    private BigDecimal transferredValue; // soma das parcelas repassadas
    private double percentExecuted;      // (transferredValue / globalValue) * 100
    private String city;
    private String region;
}
