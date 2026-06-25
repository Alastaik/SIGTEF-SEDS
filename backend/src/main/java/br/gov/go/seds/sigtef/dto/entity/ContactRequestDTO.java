package br.gov.go.seds.sigtef.dto.entity;

import br.gov.go.seds.sigtef.model.enums.ContactType;
import lombok.Data;

@Data
public class ContactRequestDTO {
    private ContactType contactType;
    private String value;
    private String description;
    private Boolean isMain;
}
