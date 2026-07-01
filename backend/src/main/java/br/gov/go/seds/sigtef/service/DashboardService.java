package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.admin.AdminDashboardDTO;
import br.gov.go.seds.sigtef.model.IssueStatus;
import br.gov.go.seds.sigtef.repository.AccountabilityIssueRepository;
import br.gov.go.seds.sigtef.repository.AccountabilityReviewRepository;
import br.gov.go.seds.sigtef.repository.LegalEntityRepository;
import br.gov.go.seds.sigtef.repository.MonthlyExecutionRepository;
import br.gov.go.seds.sigtef.repository.PartnershipAgreementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LegalEntityRepository legalEntityRepository;
    private final PartnershipAgreementRepository agreementRepository;
    private final MonthlyExecutionRepository executionRepository;
    private final AccountabilityReviewRepository reviewRepository;
    private final AccountabilityIssueRepository issueRepository;
    private final br.gov.go.seds.sigtef.repository.AccountabilityRepository accountabilityRepository;
    private final br.gov.go.seds.sigtef.repository.PartnershipAgreementProgramRepository programRepository;

    @Transactional(readOnly = true)
    public AdminDashboardDTO getGeneralDashboard() {
        
        long activeEntities = legalEntityRepository.countByStatus(br.gov.go.seds.sigtef.model.enums.EntityStatus.ATIVA);
        long activeAgreements = agreementRepository.countByStatus(br.gov.go.seds.sigtef.model.enums.AgreementStatus.ACTIVE);
        
        // Let's assume 'expiring soon' means end_date within 60 days
        LocalDate sixtyDaysFromNow = LocalDate.now().plusDays(60);
        long expiringAgreements = agreementRepository.countByStatusAndEndDateBefore(br.gov.go.seds.sigtef.model.enums.AgreementStatus.ACTIVE, sixtyDaysFromNow);

        // Prestações
        long pendingAccs = executionRepository.countByStatus(br.gov.go.seds.sigtef.model.MonthlyExecutionStatus.READY_FOR_ACCOUNTABILITY); 
        long inAnalysisAccs = executionRepository.countByStatus(br.gov.go.seds.sigtef.model.MonthlyExecutionStatus.UNDER_REVIEW);
        long approvedAccs = executionRepository.countByStatus(br.gov.go.seds.sigtef.model.MonthlyExecutionStatus.APPROVED);
        
        // Atrasos e Suspensões
        List<br.gov.go.seds.sigtef.model.Accountability> overdueAccountabilities = accountabilityRepository.findAllOverdueAccountabilities();
        long totalDelayedEntities = overdueAccountabilities.stream()
            .map(a -> a.getMonthlyExecution().getPartnershipAgreementProgram().getPartnershipAgreement().getLegalEntity().getId())
            .distinct()
            .count();
        
        // Pendências
        long openIssues = issueRepository.countByStatus(IssueStatus.OPEN);
        long overdueIssues = issueRepository.countByStatusAndDeadlineBefore(IssueStatus.OPEN, LocalDate.now());
        
        // Placeholder for financial values
        BigDecimal totalTransferred = BigDecimal.ZERO;
        BigDecimal totalApproved = BigDecimal.ZERO;

        return AdminDashboardDTO.builder()
                .totalActiveEntities(activeEntities)
                .totalActiveAgreements(activeAgreements)
                .agreementsExpiringSoon(expiringAgreements)
                .pendingAccountabilities(pendingAccs)
                .accountabilitiesInAnalysis(inAnalysisAccs)
                .accountabilitiesApprovedThisMonth(approvedAccs)
                .totalDelayedEntities(totalDelayedEntities)
                .openIssues(openIssues)
                .overdueIssues(overdueIssues)
                .totalTransferredThisMonth(totalTransferred)
                .totalApprovedThisMonth(totalApproved)
                .build();
    }

    @Transactional(readOnly = true)
    public java.util.List<br.gov.go.seds.sigtef.dto.admin.DelayedEntityDTO> getDelayedEntities() {
        List<br.gov.go.seds.sigtef.model.Accountability> overdueAccountabilities = accountabilityRepository.findAllOverdueAccountabilities();
        
        // Group by Legal Entity ID
        java.util.Map<java.util.UUID, java.util.List<br.gov.go.seds.sigtef.model.Accountability>> grouped = overdueAccountabilities.stream()
                .collect(java.util.stream.Collectors.groupingBy(a -> a.getMonthlyExecution().getPartnershipAgreementProgram().getPartnershipAgreement().getLegalEntity().getId()));

        return grouped.entrySet().stream().map(entry -> {
            br.gov.go.seds.sigtef.model.LegalEntity entity = entry.getValue().get(0).getMonthlyExecution().getPartnershipAgreementProgram().getPartnershipAgreement().getLegalEntity();
            
            java.util.List<br.gov.go.seds.sigtef.dto.admin.DelayedAccountabilityDTO> delayedDtos = entry.getValue().stream()
                    .map(a -> br.gov.go.seds.sigtef.dto.admin.DelayedAccountabilityDTO.builder()
                            .accountabilityId(a.getId())
                            .month(a.getMonthlyExecution().getMonth())
                            .year(a.getMonthlyExecution().getYear())
                            .programName(a.getMonthlyExecution().getPartnershipAgreementProgram().getProgram().getName())
                            .status(a.getStatus())
                            .build())
                    .sorted((d1, d2) -> {
                        if (d1.getYear() != d2.getYear()) return Integer.compare(d2.getYear(), d1.getYear());
                        return Integer.compare(d2.getMonth(), d1.getMonth());
                    })
                    .collect(java.util.stream.Collectors.toList());

            return br.gov.go.seds.sigtef.dto.admin.DelayedEntityDTO.builder()
                    .entityId(entity.getId())
                    .entityName(entity.getTradeName() != null ? entity.getTradeName() : entity.getCompanyName())
                    .cnpj(entity.getCnpj())
                    .totalDelayedMonths(delayedDtos.size())
                    .delayedAccountabilities(delayedDtos)
                    .build();
        }).sorted(java.util.Comparator.comparingLong(br.gov.go.seds.sigtef.dto.admin.DelayedEntityDTO::getTotalDelayedMonths).reversed())
        .collect(java.util.stream.Collectors.toList());
    }
}
