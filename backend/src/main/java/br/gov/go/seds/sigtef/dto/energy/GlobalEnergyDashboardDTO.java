package br.gov.go.seds.sigtef.dto.energy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalEnergyDashboardDTO {
    private Integer year;
    private BigDecimal totalSpentYear;
    private Long totalEntities;
    private Long totalRecords;
    
    private Map<String, BigDecimal> monthlyTotal;
    private Map<String, Integer> flagDistribution;
    
    private List<EnergyGlobalEntitySummaryDTO> entitySummaries;
    private List<EnergyRecordDTO> records;
}
