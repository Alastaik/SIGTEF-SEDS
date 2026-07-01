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
        long entitiesWithOneOverdue = accountabilityRepository.findEntitiesWithOverdueCount(1L).size();
        long entitiesWithTwoOverdue = accountabilityRepository.findEntitiesWithOverdueCount(2L).size();
        long entitiesSuspended = programRepository.countEntitiesWithSuspendedPrograms();
        
        // Pendências
        long openIssues = issueRepository.countByStatus(IssueStatus.OPEN);
        long overdueIssues = issueRepository.countByStatusAndDeadlineBefore(IssueStatus.OPEN, LocalDate.now());
        
        // Placeholder for financial values (needs complex query or sum, will use mock for initial dashboard until Sprint 3)
        BigDecimal totalTransferred = BigDecimal.ZERO;
        BigDecimal totalApproved = BigDecimal.ZERO;

        return AdminDashboardDTO.builder()
                .totalActiveEntities(activeEntities)
                .totalActiveAgreements(activeAgreements)
                .agreementsExpiringSoon(expiringAgreements)
                .pendingAccountabilities(pendingAccs)
                .accountabilitiesInAnalysis(inAnalysisAccs)
                .accountabilitiesApprovedThisMonth(approvedAccs)
                .entitiesWithOneOverdue(entitiesWithOneOverdue)
                .entitiesWithTwoOverdue(entitiesWithTwoOverdue)
                .entitiesSuspended(entitiesSuspended)
                .openIssues(openIssues)
                .overdueIssues(overdueIssues)
                .totalTransferredThisMonth(totalTransferred)
                .totalApprovedThisMonth(totalApproved)
                .build();
    }
}
