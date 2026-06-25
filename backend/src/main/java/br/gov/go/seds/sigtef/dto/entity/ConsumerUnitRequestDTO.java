package br.gov.go.seds.sigtef.dto.entity;

import br.gov.go.seds.sigtef.model.enums.UtilityType;
import lombok.Data;

@Data
public class ConsumerUnitRequestDTO {
    private UtilityType utilityType;
    private java.util.UUID providerId;
    private String unitNumber;
}
