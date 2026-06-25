package br.gov.go.seds.sigtef.dto;

import br.gov.go.seds.sigtef.model.enums.AddendumStatus;
import br.gov.go.seds.sigtef.model.enums.AddendumType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PartnershipAgreementAddendumDTO {
    private UUID id;
    private UUID partnershipAgreementId;
    private String addendumNumber;
    private AddendumType addendumType;
    private AddendumStatus status;
    private LocalDate signatureDate;
    private LocalDate startDate;
    private LocalDate newEndDate;
    private BigDecimal valueAddition;
    private String justification;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
