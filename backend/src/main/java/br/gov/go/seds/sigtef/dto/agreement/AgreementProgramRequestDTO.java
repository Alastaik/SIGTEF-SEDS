package br.gov.go.seds.sigtef.dto.agreement;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class AgreementProgramRequestDTO {
    private UUID programId;
    private BigDecimal expectedMonthlyValue;
    private BigDecimal expectedTotalValue;
    private Integer goalQuantity;
    private Integer attendanceDays;
    private BigDecimal perCapitaValue;
    private UUID consumerUnitId;
    private Boolean active;
}
