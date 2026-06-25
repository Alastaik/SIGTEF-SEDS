package br.gov.go.seds.sigtef.dto.representative;

import br.gov.go.seds.sigtef.model.enums.RepresentativeRole;
import lombok.Data;

import java.util.List;

@Data
public class InviteRequestDTO {
    private String name;
    private String email;
    private RepresentativeRole role;
    private List<String> permissions;
}
