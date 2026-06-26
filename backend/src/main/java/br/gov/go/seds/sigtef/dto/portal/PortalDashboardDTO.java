package br.gov.go.seds.sigtef.dto.portal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortalDashboardDTO {
    private long pendingAccountabilities;
    private long inAnalysisAccountabilities;
    private long approvedAccountabilities;
    private long activeAgreements;
}
