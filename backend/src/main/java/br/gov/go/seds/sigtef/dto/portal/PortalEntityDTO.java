package br.gov.go.seds.sigtef.dto.portal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortalEntityDTO {
    private String id;
    private String name;
    private String cnpj;
}
