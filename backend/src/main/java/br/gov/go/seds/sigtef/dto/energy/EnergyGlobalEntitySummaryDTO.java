package br.gov.go.seds.sigtef.dto.energy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnergyGlobalEntitySummaryDTO {
    private UUID legalEntityId;
    private String legalEntityName;
    private BigDecimal totalKwh;
    private BigDecimal totalValue;
    private Long monthsRecorded;
    private String mostFrequentFlag;
}
