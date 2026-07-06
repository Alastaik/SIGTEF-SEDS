package br.gov.go.seds.sigtef.dto.energy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnergyDashboardDTO {
    private UUID legalEntityId;
    private String legalEntityName;
    
    private List<EnergyRecordDTO> records;
    
    private BigDecimal avgValue;
    private BigDecimal avgKwh;
    private BigDecimal avgUnitCost;
    
    private BigDecimal stdDevValue;
    private BigDecimal maxValue;
    private BigDecimal minValue;
    
    private BigDecimal momChangePercentage; // month-over-month
    private BigDecimal totalPeriod;
    
    private Map<String, Integer> flagDistribution;
}
