package br.gov.go.seds.sigtef.dto.agreement;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SimulationResultDTO {
    private BigDecimal expectedMonthlyValue;
    private BigDecimal expectedTotalValue;
    private Integer totalMonths;
    private String calculationType;
}
