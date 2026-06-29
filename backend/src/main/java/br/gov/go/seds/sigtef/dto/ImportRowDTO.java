package br.gov.go.seds.sigtef.dto;

import br.gov.go.seds.sigtef.model.enums.ImportRowStatus;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ImportRowDTO {
    private UUID id;
    private UUID batchId;
    private Integer rowNumber;
    private String rawData;
    private ImportRowStatus status;
    private String errorMessage;
}
