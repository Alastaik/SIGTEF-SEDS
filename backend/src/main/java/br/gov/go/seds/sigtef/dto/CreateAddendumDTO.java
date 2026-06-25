package br.gov.go.seds.sigtef.dto;

import br.gov.go.seds.sigtef.model.enums.AddendumType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateAddendumDTO {
    @NotNull
    private UUID partnershipAgreementId;
    private String addendumNumber;
    @NotNull
    private AddendumType addendumType;
    private LocalDate signatureDate;
    private LocalDate startDate;
    private LocalDate newEndDate;
    private BigDecimal valueAddition;
    private String justification;
    private String notes;
}
