package br.gov.go.seds.sigtef.dto.agreement;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class AgreementRequestDTO {
    private UUID legalEntityId;
    private String agreementNumber;
    private Integer year;
    private UUID agreementTypeId;
    private String seiProcessNumber;
    private UUID processTypeId;
    private String objectDescription;
    private LocalDate signatureDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal globalValue;
    private String notes;
}
