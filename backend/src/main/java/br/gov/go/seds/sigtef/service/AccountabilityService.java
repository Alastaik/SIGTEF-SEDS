package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.model.*;
import br.gov.go.seds.sigtef.model.enums.AccountabilityStatus;
import br.gov.go.seds.sigtef.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountabilityService {

    private final AccountabilityRepository accountabilityRepository;
    private final AccountabilitySubmissionRepository submissionRepository;
    private final FiscalDocumentRepository fiscalDocumentRepository;
    private final AccountabilityAttachmentRepository attachmentRepository;
    private final AccountabilityReviewRepository reviewRepository;
    private final MonthlyExecutionRepository executionRepository;
    private final FileStorageService fileStorageService;
    private final AccountabilityIssueService accountabilityIssueService;

    @Transactional
    public Accountability startDraft(UUID executionId) {
        MonthlyExecution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new IllegalArgumentException("Execution not found"));

        Optional<Accountability> existing = accountabilityRepository.findByMonthlyExecutionId(executionId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Accountability accountability = Accountability.builder()
                .monthlyExecution(execution)
                .status(AccountabilityStatus.DRAFT)
                .build();
        accountability = accountabilityRepository.save(accountability);

        AccountabilitySubmission submission = AccountabilitySubmission.builder()
                .accountability(accountability)
                .versionNumber(1)
                .build();
        submissionRepository.save(submission);

        execution.setStatus(MonthlyExecutionStatus.ACCOUNTABILITY_DRAFT);
        executionRepository.save(execution);

        return accountability;
    }

    @Transactional
    public FiscalDocument addFiscalDocumentByExecution(UUID executionId, FiscalDocument document) {
        Accountability accountability = accountabilityRepository.findByMonthlyExecutionId(executionId)
                .orElseThrow(() -> new IllegalArgumentException("Accountability not started for this execution"));
        
        List<AccountabilitySubmission> submissions = submissionRepository.findByAccountabilityIdOrderByVersionNumberDesc(accountability.getId());
        if (submissions.isEmpty()) throw new IllegalStateException("No submissions found");

        AccountabilitySubmission submission = submissions.get(0);
        
        document.setSubmission(submission);

        if (document.getItems() != null) {
            document.getItems().forEach(item -> item.setFiscalDocument(document));
        }

        if (document.getAttachments() != null && !document.getAttachments().isEmpty()) {
            List<AccountabilityAttachment> realAttachments = new java.util.ArrayList<>();
            for (AccountabilityAttachment att : document.getAttachments()) {
                if (att.getId() != null) {
                    AccountabilityAttachment realAtt = attachmentRepository.findById(att.getId())
                            .orElseThrow(() -> new IllegalArgumentException("Attachment not found: " + att.getId()));
                    realAtt.setFiscalDocument(document);
                    realAttachments.add(realAtt);
                }
            }
            document.setAttachments(realAttachments);
        }

        return fiscalDocumentRepository.save(document);
    }

    @Transactional
    public AccountabilityAttachment uploadAttachment(UUID fiscalDocumentId, UUID submissionId, MultipartFile file) {
        String fileName = fileStorageService.storeFile(file);
        
        FiscalDocument fiscalDocument = null;
        if (fiscalDocumentId != null) {
            fiscalDocument = fiscalDocumentRepository.findById(fiscalDocumentId).orElse(null);
        }

        AccountabilitySubmission submission = null;
        if (submissionId != null) {
            submission = submissionRepository.findById(submissionId).orElse(null);
        }

        AccountabilityAttachment attachment = AccountabilityAttachment.builder()
                .fiscalDocument(fiscalDocument)
                .submission(submission)
                .fileName(file.getOriginalFilename())
                .filePath(fileName)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .build();

        return attachmentRepository.save(attachment);
    }

    @Transactional
    public Accountability submitByExecution(UUID executionId, UUID userId) {
        Accountability accountability = accountabilityRepository.findByMonthlyExecutionId(executionId)
                .orElseThrow(() -> new IllegalArgumentException("Accountability not started"));

        List<AccountabilitySubmission> submissions = submissionRepository.findByAccountabilityIdOrderByVersionNumberDesc(accountability.getId());
        if (submissions.isEmpty()) throw new IllegalStateException("No submissions found");

        AccountabilitySubmission latest = submissions.get(0);
        
        // TODO: Associate with user who submitted
        latest.setSubmittedAt(LocalDateTime.now());
        submissionRepository.save(latest);

        accountability.setStatus(AccountabilityStatus.SUBMITTED);
        accountabilityRepository.save(accountability);

        MonthlyExecution execution = accountability.getMonthlyExecution();
        execution.setStatus(MonthlyExecutionStatus.SUBMITTED);
        executionRepository.save(execution);

        return accountability;
    }

    @Transactional
    public AccountabilityReview reviewByExecution(UUID executionId, br.gov.go.seds.sigtef.dto.AccountabilityReviewRequestDTO dto, br.gov.go.seds.sigtef.model.User reviewer) {
        Accountability accountability = accountabilityRepository.findByMonthlyExecutionId(executionId)
                .orElseThrow(() -> new IllegalArgumentException("Accountability not started"));

        if (dto.getStatus() == AccountabilityStatus.APPROVED && accountabilityIssueService.hasBlockingIssues(accountability.getId())) {
            throw new IllegalStateException("Não é possível aprovar a prestação de contas pois existem pendências abertas ou em análise.");
        }

        List<AccountabilitySubmission> submissions = submissionRepository.findByAccountabilityIdOrderByVersionNumberDesc(accountability.getId());
        if (submissions.isEmpty()) throw new IllegalStateException("No submissions found");

        AccountabilitySubmission latest = submissions.get(0);

        AccountabilityReview review = AccountabilityReview.builder()
                .submission(latest)
                .reviewer(reviewer)
                .status(dto.getStatus())
                .comments(dto.getComments())
                .reviewedAt(LocalDateTime.now())
                .build();

        review = reviewRepository.save(review);

        accountability.setStatus(dto.getStatus());
        accountabilityRepository.save(accountability);

        MonthlyExecution execution = accountability.getMonthlyExecution();
        
        // Mapear AccountabilityStatus para MonthlyExecutionStatus
        if (dto.getStatus() == AccountabilityStatus.APPROVED) {
            execution.setStatus(MonthlyExecutionStatus.APPROVED);
        } else if (dto.getStatus() == AccountabilityStatus.REJECTED) {
            execution.setStatus(MonthlyExecutionStatus.REJECTED);
        } else if (dto.getStatus() == AccountabilityStatus.PENDING_CORRECTION) {
            execution.setStatus(MonthlyExecutionStatus.PENDING_CORRECTION);
        }

        executionRepository.save(execution);

        return review;
    }

    @Transactional(readOnly = true)
    public AccountabilitySubmission getSubmissionByExecution(UUID executionId) {
        Accountability accountability = accountabilityRepository.findByMonthlyExecutionId(executionId)
                .orElseThrow(() -> new IllegalArgumentException("Accountability not started"));

        List<AccountabilitySubmission> submissions = submissionRepository.findByAccountabilityIdOrderByVersionNumberDesc(accountability.getId());
        if (submissions.isEmpty()) throw new IllegalStateException("No submissions found");

        AccountabilitySubmission submission = submissions.get(0);
        return submission;
    }
}
