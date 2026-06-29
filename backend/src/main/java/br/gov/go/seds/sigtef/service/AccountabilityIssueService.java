package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.*;
import br.gov.go.seds.sigtef.mapper.AccountabilityIssueMapper;
import br.gov.go.seds.sigtef.model.*;
import br.gov.go.seds.sigtef.model.enums.AccountabilityStatus;
import br.gov.go.seds.sigtef.repository.AccountabilityIssueRepository;
import br.gov.go.seds.sigtef.repository.AccountabilityIssueResponseRepository;
import br.gov.go.seds.sigtef.repository.AccountabilityRepository;
import br.gov.go.seds.sigtef.repository.UserRepository;
import br.gov.go.seds.sigtef.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AccountabilityIssueService {

    private final AccountabilityIssueRepository issueRepository;
    private final AccountabilityIssueResponseRepository responseRepository;
    private final AccountabilityRepository accountabilityRepository;
    private final UserRepository userRepository;
    private final AccountabilityIssueMapper issueMapper;
    private final SecurityUtils securityUtils;
    private final MonthlyExecutionService monthlyExecutionService;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public AccountabilityIssueService(AccountabilityIssueRepository issueRepository,
                                      AccountabilityIssueResponseRepository responseRepository,
                                      AccountabilityRepository accountabilityRepository,
                                      UserRepository userRepository,
                                      AccountabilityIssueMapper issueMapper,
                                      SecurityUtils securityUtils,
                                      MonthlyExecutionService monthlyExecutionService,
                                      org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.issueRepository = issueRepository;
        this.responseRepository = responseRepository;
        this.accountabilityRepository = accountabilityRepository;
        this.userRepository = userRepository;
        this.issueMapper = issueMapper;
        this.securityUtils = securityUtils;
        this.monthlyExecutionService = monthlyExecutionService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public List<AccountabilityIssueDTO> getIssuesByAccountability(UUID accountabilityId) {
        return issueMapper.toDtoList(issueRepository.findByAccountabilityId(accountabilityId));
    }

    @Transactional
    public AccountabilityIssueDTO createIssue(UUID accountabilityId, IssueCreateDTO dto) {
        Accountability accountability = accountabilityRepository.findById(accountabilityId)
                .orElseThrow(() -> new IllegalArgumentException("Prestação de contas não encontrada"));

        User currentUser = userRepository.findById(securityUtils.getCurrentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        AccountabilityIssue issue = new AccountabilityIssue();
        issue.setAccountability(accountability);
        issue.setCreatedBy(currentUser);
        issue.setIssueType(dto.getIssueType());
        issue.setPriority(dto.getPriority());
        issue.setDescription(dto.getDescription());
        issue.setDeadline(dto.getDeadline());
        issue.setStatus(IssueStatus.OPEN);

        issue = issueRepository.save(issue);
        
        // Publish event
        UUID legalEntityId = accountability.getMonthlyExecution().getPartnershipAgreementProgram().getPartnershipAgreement().getLegalEntity().getId();
        eventPublisher.publishEvent(new br.gov.go.seds.sigtef.event.IssueCreatedEvent(
            issue.getId(), 
            accountabilityId, 
            legalEntityId,
            issue.getIssueType().name(),
            issue.getDescription()
        ));
        
        return issueMapper.toDto(issue);
    }

    @Transactional
    public void notifyIssues(UUID accountabilityId) {
        Accountability accountability = accountabilityRepository.findById(accountabilityId)
                .orElseThrow(() -> new IllegalArgumentException("Prestação de contas não encontrada"));

        List<AccountabilityIssue> openIssues = issueRepository.findByAccountabilityIdAndStatus(accountabilityId, IssueStatus.OPEN);
        if (openIssues.isEmpty()) {
            throw new IllegalArgumentException("Não há pendências abertas para notificar");
        }

        for (AccountabilityIssue issue : openIssues) {
            issue.setStatus(IssueStatus.NOTIFIED);
            issueRepository.save(issue);
        }

        // Change Accountability and Monthly Execution Status
        accountability.setStatus(AccountabilityStatus.PENDING_CORRECTION);
        accountabilityRepository.save(accountability);
        
        monthlyExecutionService.updateExecutionStatus(accountability.getMonthlyExecution().getId(), MonthlyExecutionStatus.PENDING_CORRECTION);
    }

    @Transactional
    public AccountabilityIssueDTO cancelIssue(UUID issueId, String reason) {
        AccountabilityIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Pendência não encontrada"));

        issue.setStatus(IssueStatus.CANCELED);
        issue.setCancellationReason(reason);
        issue = issueRepository.save(issue);

        checkAndUnblockAccountability(issue.getAccountability().getId());

        return issueMapper.toDto(issue);
    }

    @Transactional
    public AccountabilityIssueDTO submitResponse(UUID issueId, IssueResponseCreateDTO dto) {
        AccountabilityIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Pendência não encontrada"));

        if (issue.getStatus() != IssueStatus.NOTIFIED && issue.getStatus() != IssueStatus.REOPENED) {
            throw new IllegalArgumentException("A pendência não está apta para resposta no momento");
        }

        User currentUser = userRepository.findById(securityUtils.getCurrentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        int nextVersion = issue.getResponses().size() + 1;

        AccountabilityIssueResponse response = new AccountabilityIssueResponse();
        response.setIssue(issue);
        response.setVersionNumber(nextVersion);
        response.setSubmittedBy(currentUser);
        response.setResponseText(dto.getResponseText());
        response.setStatus(IssueResponseStatus.SUBMITTED);
        
        responseRepository.save(response);

        issue.setStatus(IssueStatus.ANSWERED);
        issueRepository.save(issue);

        // Update Accountability to Resubmitted
        Accountability accountability = issue.getAccountability();
        accountability.setStatus(AccountabilityStatus.RESUBMITTED);
        accountabilityRepository.save(accountability);
        monthlyExecutionService.updateExecutionStatus(accountability.getMonthlyExecution().getId(), MonthlyExecutionStatus.RESUBMITTED);

        return issueMapper.toDto(issue);
    }

    @Transactional
    public AccountabilityIssueDTO reviewResponse(UUID issueId, UUID responseId, IssueReviewDTO dto) {
        AccountabilityIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Pendência não encontrada"));

        AccountabilityIssueResponse response = responseRepository.findById(responseId)
                .orElseThrow(() -> new IllegalArgumentException("Resposta não encontrada"));

        User currentUser = userRepository.findById(securityUtils.getCurrentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        response.setStatus(dto.getStatus());
        response.setReviewedBy(currentUser);
        response.setReviewedAt(LocalDateTime.now());
        response.setReviewNotes(dto.getReviewNotes());
        responseRepository.save(response);

        if (dto.getStatus() == IssueResponseStatus.ACCEPTED) {
            issue.setStatus(IssueStatus.RESOLVED);
            issue.setResolvedAt(LocalDateTime.now());
        } else if (dto.getStatus() == IssueResponseStatus.REJECTED) {
            if (dto.getReopenIssue() != null && dto.getReopenIssue()) {
                issue.setStatus(IssueStatus.REOPENED);
            } else {
                issue.setStatus(IssueStatus.REJECTED_RESPONSE);
            }
        }
        
        issueRepository.save(issue);

        checkAndUnblockAccountability(issue.getAccountability().getId());

        return issueMapper.toDto(issue);
    }

    private void checkAndUnblockAccountability(UUID accountabilityId) {
        List<AccountabilityIssue> blockingIssues = issueRepository.findByAccountabilityIdAndStatusNotIn(
                accountabilityId, List.of(IssueStatus.RESOLVED, IssueStatus.CANCELED));
        
        if (blockingIssues.isEmpty()) {
            Accountability accountability = accountabilityRepository.findById(accountabilityId).orElseThrow();
            accountability.setStatus(AccountabilityStatus.UNDER_REVIEW);
            accountabilityRepository.save(accountability);
            monthlyExecutionService.updateExecutionStatus(accountability.getMonthlyExecution().getId(), MonthlyExecutionStatus.UNDER_REVIEW);
        }
    }

    @Transactional(readOnly = true)
    public boolean hasBlockingIssues(UUID accountabilityId) {
        List<AccountabilityIssue> blockingIssues = issueRepository.findByAccountabilityIdAndStatusNotIn(
                accountabilityId, List.of(IssueStatus.RESOLVED, IssueStatus.CANCELED));
        return !blockingIssues.isEmpty();
    }
}
