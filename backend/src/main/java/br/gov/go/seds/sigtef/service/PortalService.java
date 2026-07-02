package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.portal.PortalDashboardDTO;
import br.gov.go.seds.sigtef.dto.portal.PortalEntityDTO;
import br.gov.go.seds.sigtef.model.LegalEntity;
import br.gov.go.seds.sigtef.model.PartnershipAgreement;
import br.gov.go.seds.sigtef.model.enums.AccountabilityStatus;
import br.gov.go.seds.sigtef.repository.AccountabilityRepository;
import br.gov.go.seds.sigtef.repository.PartnershipAgreementRepository;
import br.gov.go.seds.sigtef.repository.MonthlyExecutionRepository;
import br.gov.go.seds.sigtef.model.MonthlyExecution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortalService {

    private final RepresentativeService representativeService;
    private final AccountabilityRepository accountabilityRepository;
    private final PartnershipAgreementRepository partnershipAgreementRepository;
    private final MonthlyExecutionRepository monthlyExecutionRepository;
    private final br.gov.go.seds.sigtef.repository.AccountabilityIssueRepository accountabilityIssueRepository;
    private final br.gov.go.seds.sigtef.repository.AccountabilityIssueResponseRepository accountabilityIssueResponseRepository;
    private final br.gov.go.seds.sigtef.repository.UserRepository userRepository;
    private final br.gov.go.seds.sigtef.repository.AccountabilitySubmissionRepository accountabilitySubmissionRepository;
    private final br.gov.go.seds.sigtef.repository.AccountabilityReviewRepository accountabilityReviewRepository;

    public List<PortalEntityDTO> getMyEntities(UUID userId) {
        // Obter as entidades onde o usuario eh representante
        List<LegalEntity> entities = representativeService.getEntitiesForUser(userId);
        return entities.stream().map(e -> PortalEntityDTO.builder()
                .id(e.getId().toString())
                .name(e.getCorporateName())
                .cnpj(e.getCnpj())
                .build()).collect(Collectors.toList());
    }

    public PortalDashboardDTO getDashboard(UUID entityId) {
        // Validar se entidade pertence ao usuario logado poderia ser feito aqui, 
        // ou no controller apos extrair o userId do token

        long pendingAccountabilities = accountabilityRepository.countByLegalEntityIdAndStatusIn(entityId, 
                List.of(AccountabilityStatus.DRAFT, AccountabilityStatus.PENDING_CORRECTION));
                
        long pendingMonthlyExecutions = monthlyExecutionRepository.countByLegalEntityIdAndStatus(entityId, 
                br.gov.go.seds.sigtef.model.MonthlyExecutionStatus.READY_FOR_ACCOUNTABILITY);
                
        long pending = pendingAccountabilities + pendingMonthlyExecutions;

        long inAnalysis = accountabilityRepository.countByLegalEntityIdAndStatusIn(entityId, 
                List.of(AccountabilityStatus.SUBMITTED, AccountabilityStatus.RESUBMITTED, AccountabilityStatus.UNDER_REVIEW));

        long approved = accountabilityRepository.countByLegalEntityIdAndStatusIn(entityId, 
                List.of(AccountabilityStatus.APPROVED));

        List<PartnershipAgreement> agreements = partnershipAgreementRepository.findByLegalEntityId(entityId);
        long activeAgreements = agreements.stream().filter(a -> a.getStatus().name().equals("ACTIVE") || a.getStatus().name().equals("VIGENTE")).count(); 
        // Assuming ACTIVE or equivalent status string exists.

        return PortalDashboardDTO.builder()
                .pendingAccountabilities(pending)
                .inAnalysisAccountabilities(inAnalysis)
                .approvedAccountabilities(approved)
                .activeAgreements(activeAgreements)
                .build();
    }

    public Page<MonthlyExecution> getCompetences(UUID entityId, String competence, String status, Pageable pageable) {
        // Aproveitando findByFilters do MonthlyExecutionRepository:
        // (competence, legalEntityId, programId, status, pageable)
        return monthlyExecutionRepository.findByFilters(competence, entityId, null, status, pageable);
    }
    
    public MonthlyExecution getCompetenceById(UUID executionId) {
        return monthlyExecutionRepository.findById(executionId).orElseThrow(() -> new RuntimeException("Competence not found"));
    }

    public List<PartnershipAgreement> getAgreements(UUID entityId) {
        return partnershipAgreementRepository.findByLegalEntityId(entityId);
    }

    public List<br.gov.go.seds.sigtef.model.AccountabilityIssue> getIssues(UUID entityId) {
        return accountabilityIssueRepository.findByEntityId(entityId);
    }

    public br.gov.go.seds.sigtef.model.AccountabilityIssueResponse respondIssue(UUID entityId, UUID issueId, String responseText) {
        br.gov.go.seds.sigtef.model.AccountabilityIssue issue = accountabilityIssueRepository.findById(issueId)
            .orElseThrow(() -> new RuntimeException("Issue not found"));

        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof br.gov.go.seds.sigtef.security.UserDetailsImpl)) {
            throw new RuntimeException("Usuário não autenticado");
        }
        UUID userId = ((br.gov.go.seds.sigtef.security.UserDetailsImpl) authentication.getPrincipal()).getId();
        br.gov.go.seds.sigtef.model.User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        br.gov.go.seds.sigtef.model.AccountabilityIssueResponse response = new br.gov.go.seds.sigtef.model.AccountabilityIssueResponse();
        response.setIssue(issue);
        response.setResponseText(responseText);
        response.setVersionNumber(1); // or get latest + 1 if implementing versioning
        response.setSubmittedBy(user);
        response.setStatus(br.gov.go.seds.sigtef.model.IssueResponseStatus.SUBMITTED);
        
        return accountabilityIssueResponseRepository.save(response);
    }

    public List<br.gov.go.seds.sigtef.dto.TimelineEventDTO> getAccountabilityTimeline(UUID accountabilityId) {
        List<br.gov.go.seds.sigtef.dto.TimelineEventDTO> timeline = new java.util.ArrayList<>();
        
        br.gov.go.seds.sigtef.model.Accountability acc = accountabilityRepository.findById(accountabilityId).orElseThrow(() -> new RuntimeException("Accountability not found"));
        
        String corporateName = "Entidade";
        if (acc.getMonthlyExecution() != null 
            && acc.getMonthlyExecution().getPartnershipAgreementProgram() != null 
            && acc.getMonthlyExecution().getPartnershipAgreementProgram().getPartnershipAgreement() != null 
            && acc.getMonthlyExecution().getPartnershipAgreementProgram().getPartnershipAgreement().getLegalEntity() != null) {
            corporateName = acc.getMonthlyExecution().getPartnershipAgreementProgram().getPartnershipAgreement().getLegalEntity().getCorporateName();
        }

        timeline.add(br.gov.go.seds.sigtef.dto.TimelineEventDTO.builder()
            .id(acc.getId())
            .date(acc.getCreatedAt())
            .title("Prestação de Contas Iniciada")
            .type("INICIADA")
            .actor(corporateName)
            .build());
            
        List<br.gov.go.seds.sigtef.model.AccountabilitySubmission> submissions = accountabilitySubmissionRepository.findByAccountabilityIdOrderByVersionNumberDesc(accountabilityId);
        for (br.gov.go.seds.sigtef.model.AccountabilitySubmission sub : submissions) {
            timeline.add(br.gov.go.seds.sigtef.dto.TimelineEventDTO.builder()
                .id(sub.getId())
                .date(sub.getSubmittedAt() != null ? sub.getSubmittedAt() : sub.getCreatedAt())
                .title("Prestação Enviada")
                .type("ENVIADA")
                .actor(sub.getSubmittedBy() != null ? sub.getSubmittedBy().getName() : "Entidade")
                .build());
                
            List<br.gov.go.seds.sigtef.model.AccountabilityReview> reviews = accountabilityReviewRepository.findBySubmissionIdOrderByReviewedAtDesc(sub.getId());
            for (br.gov.go.seds.sigtef.model.AccountabilityReview rev : reviews) {
                timeline.add(br.gov.go.seds.sigtef.dto.TimelineEventDTO.builder()
                    .id(rev.getId())
                    .date(rev.getReviewedAt())
                    .title("Entrou em Análise / Analisada")
                    .description("Status da análise: " + (rev.getStatus() != null ? rev.getStatus().name() : "Desconhecido"))
                    .type("ANALISE")
                    .actor("SEDS")
                    .build());
            }
        }
        
        List<br.gov.go.seds.sigtef.model.AccountabilityIssue> issues = accountabilityIssueRepository.findByAccountabilityId(accountabilityId);
        for (br.gov.go.seds.sigtef.model.AccountabilityIssue issue : issues) {
            timeline.add(br.gov.go.seds.sigtef.dto.TimelineEventDTO.builder()
                .id(issue.getId())
                .date(issue.getCreatedAt())
                .title("Pendência: " + issue.getIssueType().name())
                .description(issue.getDescription())
                .type("PENDENCIA")
                .actor(issue.getCreatedBy() != null ? issue.getCreatedBy().getName() : "SEDS")
                .build());
                
            if (issue.getResolvedAt() != null) {
                timeline.add(br.gov.go.seds.sigtef.dto.TimelineEventDTO.builder()
                    .id(UUID.randomUUID())
                    .date(issue.getResolvedAt())
                    .title("Pendência Resolvida")
                    .type("PENDENCIA_RESOLVIDA")
                    .actor("SEDS")
                    .build());
            }
            
            List<br.gov.go.seds.sigtef.model.AccountabilityIssueResponse> responses = accountabilityIssueResponseRepository.findByIssueIdOrderByVersionNumberDesc(issue.getId());
            for (br.gov.go.seds.sigtef.model.AccountabilityIssueResponse resp : responses) {
                timeline.add(br.gov.go.seds.sigtef.dto.TimelineEventDTO.builder()
                    .id(resp.getId())
                    .date(resp.getSubmittedAt())
                    .title("Resposta à Pendência")
                    .description(resp.getResponseText())
                    .type("RESPOSTA")
                    .actor(resp.getSubmittedBy() != null ? resp.getSubmittedBy().getName() : "Entidade")
                    .build());
            }
        }
        
        if (acc.getStatus() == AccountabilityStatus.APPROVED) {
            timeline.add(br.gov.go.seds.sigtef.dto.TimelineEventDTO.builder()
                .id(UUID.randomUUID())
                .date(acc.getUpdatedAt() != null ? acc.getUpdatedAt() : java.time.LocalDateTime.now())
                .title("Prestação Aprovada")
                .type("APROVADA")
                .actor("SEDS")
                .build());
        }
        
        timeline.sort(java.util.Comparator.comparing(br.gov.go.seds.sigtef.dto.TimelineEventDTO::getDate, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder())));
        return timeline;
    }
}
