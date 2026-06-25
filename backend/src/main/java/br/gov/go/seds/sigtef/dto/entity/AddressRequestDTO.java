package br.gov.go.seds.sigtef.dto.entity;

import br.gov.go.seds.sigtef.model.enums.AddressType;
import lombok.Data;
import java.util.UUID;

@Data
public class AddressRequestDTO {
    private AddressType addressType;
    private UUID cityId;
    private String street;
    private String number;
    private String complement;
    private String neighborhood;
    private String zipCode;
    private Boolean isMain;
}
