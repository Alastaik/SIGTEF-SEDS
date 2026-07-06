package br.gov.go.seds.sigtef.dto.energy;

import br.gov.go.seds.sigtef.model.enums.TariffFlag;
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
public class EnergyRecordDTO {
    private UUID id;
    private UUID legalEntityId;
    private String legalEntityName;
    private UUID consumerUnitId;
    private String consumerUnitNumber;
    private UUID competenceId;
    private Integer competenceMonth;
    private Integer competenceYear;
    private String competenceDisplay;
    private BigDecimal kwhAmount;
    private TariffFlag tariffFlag;
    private BigDecimal totalValue;
    private BigDecimal kwhUnitCost;
    private String notes;
}
