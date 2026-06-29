package br.gov.go.seds.sigtef.dto;

import br.gov.go.seds.sigtef.model.enums.ImportBatchStatus;
import br.gov.go.seds.sigtef.model.enums.ImportMode;
import br.gov.go.seds.sigtef.model.enums.ImportType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ImportBatchDTO {
    private UUID id;
    private ImportType importType;
    private ImportMode mode;
    private ImportBatchStatus status;
    private String originalFileName;
    private Integer totalRows;
    private Integer validRows;
    private Integer errorRows;
    private Integer appliedRows;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
