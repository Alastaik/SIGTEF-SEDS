package br.gov.go.seds.sigtef.dto.agreement;

import br.gov.go.seds.sigtef.model.enums.AgreementStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AgreementResponseDTO {
    private UUID id;
    private UUID legalEntityId;
    private String legalEntityName;
    private String agreementNumber;
    private Integer year;
    private UUID agreementTypeId;
    private String agreementTypeName;
    private String seiProcessNumber;
    private UUID processTypeId;
    private String processTypeName;
    private String objectDescription;
    private LocalDate signatureDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal globalValue;
    private AgreementStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
