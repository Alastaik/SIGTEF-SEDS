package br.gov.go.seds.sigtef.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DelayedEntityDTO {
    private UUID entityId;
    private String entityName;
    private String cnpj;
    private long totalDelayedMonths;
    private List<DelayedAccountabilityDTO> delayedAccountabilities;
}
