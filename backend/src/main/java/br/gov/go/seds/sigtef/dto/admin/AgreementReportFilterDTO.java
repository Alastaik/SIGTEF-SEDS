package br.gov.go.seds.sigtef.dto.admin;

import br.gov.go.seds.sigtef.model.enums.AgreementStatus;
import lombok.Data;

import java.util.UUID;

@Data
public class AgreementReportFilterDTO {
    private String search;              // busca por nome da entidade ou número do termo
    private AgreementStatus status;
    private UUID programId;
    private Integer expiresInDays;      // próximos N dias até o vencimento (30, 60, 90)
    private Boolean expired;            // true = somente vencidos
    private Integer year;
    private UUID cityId;
    private UUID regionId;
}
