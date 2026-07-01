package br.gov.go.seds.sigtef.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {
    private long totalActiveEntities;
    private long totalActiveAgreements;
    private long agreementsExpiringSoon;
    
    // Prestações
    private long pendingAccountabilities;
    private long accountabilitiesInAnalysis;
    private long accountabilitiesApprovedThisMonth;
    private long entitiesWithOneOverdue;
    private long entitiesWithTwoOverdue;
    private long entitiesSuspended;
    
    // Pendências
    private long openIssues;
    private long overdueIssues;
    
    // Financeiro
    private BigDecimal totalTransferredThisMonth;
    private BigDecimal totalApprovedThisMonth;
}
