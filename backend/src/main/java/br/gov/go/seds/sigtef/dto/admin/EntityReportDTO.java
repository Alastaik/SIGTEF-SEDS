package br.gov.go.seds.sigtef.dto.admin;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

@Data
@Builder
public class EntityReportDTO {
    private UUID id;
    private String name;
    private String cnpj;
    private String status;
    private String city;
    private String region;
    private List<String> activePrograms;
    private int totalAgreements;
    private int activeAgreements;
    private BigDecimal totalTransferred;
}
