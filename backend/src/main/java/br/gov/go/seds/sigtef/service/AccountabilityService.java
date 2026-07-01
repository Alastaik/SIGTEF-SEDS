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

    private final AccountabilityReviewRepository reviewRepository;
    private final MonthlyExecutionRepository executionRepository;
    private final FileStorageService fileStorageService;
    private final AccountabilityIssueService accountabilityIssueService;
    private final DocumentLinkRepository documentLinkRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;

    @Transactional
    public Accountability startDraft(UUID executionId, UUID userId) {
        MonthlyExecution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new IllegalArgumentException("Execution not found"));

        Optional<Accountability> existing = accountabilityRepository.findByMonthlyExecutionId(executionId);
        if (existing.isPresent()) {
            Accountability accountability = existing.get();
            if (accountability.getStatus() == AccountabilityStatus.PENDING_CORRECTION) {
                List<AccountabilitySubmission> submissions = submissionRepository.findByAccountabilityIdOrderByVersionNumberDesc(accountability.getId());
                if (!submissions.isEmpty()) {
                    AccountabilitySubmission latest = submissions.get(0);
                    if (latest.getSubmittedAt() != null) {
                        User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                        cloneSubmission(latest, user);
                    }
                }
            }
            return accountability;
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

    private void cloneSubmission(AccountabilitySubmission oldSubmission, User user) {
        AccountabilitySubmission newSubmission = AccountabilitySubmission.builder()
                .accountability(oldSubmission.getAccountability())
                .versionNumber(oldSubmission.getVersionNumber() + 1)
                .build();
        newSubmission = submissionRepository.save(newSubmission);

        for (FiscalDocument oldDoc : oldSubmission.getFiscalDocuments()) {
            FiscalDocument newDoc = FiscalDocument.builder()
                    .submission(newSubmission)
                    .documentType(oldDoc.getDocumentType())
                    .documentNumber(oldDoc.getDocumentNumber())
                    .accessKey(oldDoc.getAccessKey())
                    .issueDate(oldDoc.getIssueDate())
                    .issuerCnpj(oldDoc.getIssuerCnpj())
                    .issuerName(oldDoc.getIssuerName())
                    .value(oldDoc.getValue())
                    .reviewStatus(oldDoc.getReviewStatus())
                    .reviewComments(oldDoc.getReviewComments())
                    .build();
            
            if (oldDoc.getItems() != null) {
                List<FiscalDocumentItem> newItems = new java.util.ArrayList<>();
                for (FiscalDocumentItem oldItem : oldDoc.getItems()) {
                    FiscalDocumentItem newItem = FiscalDocumentItem.builder()
                            .fiscalDocument(newDoc)
                            .item(oldItem.getItem())
                            .quantity(oldItem.getQuantity())
                            .unitPrice(oldItem.getUnitPrice())
                            .totalPrice(oldItem.getTotalPrice())
                            .build();
                    newItems.add(newItem);
                }
                newDoc.setItems(newItems);
            }
            newDoc = fiscalDocumentRepository.save(newDoc);

            // Clone DocumentLinks from module 12
            List<DocumentLink> oldLinks = documentLinkRepository.findByLinkedEntityTypeAndLinkedEntityId("FISCAL_DOCUMENT", oldDoc.getId());
            for (DocumentLink oldLink : oldLinks) {
                DocumentLink newLink = DocumentLink.builder()
                        .document(oldLink.getDocument())
                        .linkedEntityType(oldLink.getLinkedEntityType())
                        .linkedEntityId(newDoc.getId())
                        .role(oldLink.getRole())
                        .createdBy(user)
                        .build();
                documentLinkRepository.save(newLink);
            }
        }

        // Clone Complementary Documents
        if (oldSubmission.getComplementaryDocuments() != null) {
            newSubmission.setComplementaryDocuments(new java.util.ArrayList<>(oldSubmission.getComplementaryDocuments()));
            submissionRepository.save(newSubmission);
        }
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



        return fiscalDocumentRepository.save(document);
    }

    @Transactional
    public FiscalDocument updateFiscalDocument(UUID documentId, FiscalDocument updatedDoc) {
        FiscalDocument existing = fiscalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        existing.setDocumentType(updatedDoc.getDocumentType());
        existing.setDocumentNumber(updatedDoc.getDocumentNumber());
        existing.setAccessKey(updatedDoc.getAccessKey());
        existing.setIssueDate(updatedDoc.getIssueDate());
        existing.setIssuerCnpj(updatedDoc.getIssuerCnpj());
        existing.setIssuerName(updatedDoc.getIssuerName());
        existing.setValue(updatedDoc.getValue());
        
        // Reset review status since it was edited
        existing.setReviewStatus(null);
        existing.setReviewComments(null);

        return fiscalDocumentRepository.save(existing);
    }

    @Transactional
    public void addComplementaryDocument(UUID executionId, UUID documentId) {
        Accountability accountability = accountabilityRepository.findByMonthlyExecutionId(executionId)
                .orElseThrow(() -> new IllegalArgumentException("Accountability not started for this execution"));

        List<AccountabilitySubmission> submissions = submissionRepository.findByAccountabilityIdOrderByVersionNumberDesc(accountability.getId());
        if (submissions.isEmpty()) throw new IllegalStateException("No submissions found");

        AccountabilitySubmission submission = submissions.get(0);
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        if (!submission.getComplementaryDocuments().contains(document)) {
            submission.getComplementaryDocuments().add(document);
            submissionRepository.save(submission);
        }
    }

    @Transactional
    public void removeComplementaryDocument(UUID executionId, UUID documentId) {
        Accountability accountability = accountabilityRepository.findByMonthlyExecutionId(executionId)
                .orElseThrow(() -> new IllegalArgumentException("Accountability not started for this execution"));

        List<AccountabilitySubmission> submissions = submissionRepository.findByAccountabilityIdOrderByVersionNumberDesc(accountability.getId());
        if (submissions.isEmpty()) throw new IllegalStateException("No submissions found");

        AccountabilitySubmission submission = submissions.get(0);
        
        submission.getComplementaryDocuments().removeIf(doc -> doc.getId().equals(documentId));
        submissionRepository.save(submission);
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

        boolean wasPendingCorrection = accountability.getStatus() == AccountabilityStatus.PENDING_CORRECTION;

        accountability.setStatus(wasPendingCorrection ? AccountabilityStatus.RESUBMITTED : AccountabilityStatus.SUBMITTED);
        accountabilityRepository.save(accountability);

        MonthlyExecution execution = accountability.getMonthlyExecution();
        execution.setStatus(wasPendingCorrection ? MonthlyExecutionStatus.RESUBMITTED : MonthlyExecutionStatus.SUBMITTED);
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

    @Transactional(readOnly = true)
    public AccountabilityReview getLatestReviewByExecution(UUID executionId) {
        Accountability accountability = accountabilityRepository.findByMonthlyExecutionId(executionId)
                .orElseThrow(() -> new IllegalArgumentException("Accountability not started"));
        
        List<AccountabilityReview> reviews = reviewRepository.findBySubmissionIdOrderByReviewedAtDesc(
                submissionRepository.findByAccountabilityIdOrderByVersionNumberDesc(accountability.getId())
                        .stream().findFirst().map(AccountabilitySubmission::getId).orElse(null)
        );
        
        if (reviews != null && !reviews.isEmpty()) {
            return reviews.get(0);
        }
        return null;
    }

    @Transactional
    public FiscalDocument reviewFiscalDocument(UUID documentId, br.gov.go.seds.sigtef.dto.DocumentReviewRequestDTO dto) {
        FiscalDocument document = fiscalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        document.setReviewStatus(dto.getStatus());
        document.setReviewComments(dto.getComments());

        return fiscalDocumentRepository.save(document);
    }
    
    @Transactional
    public void reopenAccountabilityByExecution(UUID executionId, int days) {
        Accountability acc = accountabilityRepository.findByMonthlyExecutionId(executionId)
                .orElseThrow(() -> new IllegalArgumentException("Prestação não encontrada"));
        
        if (acc.getStatus() != AccountabilityStatus.CLOSED_UNREALIZED) {
            throw new IllegalStateException("Apenas prestações fechadas sem realização podem ser reabertas");
        }
        
        acc.setStatus(AccountabilityStatus.DRAFT);
        acc.setReopenedUntil(java.time.LocalDateTime.now().plusDays(days));
        accountabilityRepository.save(acc);
        
        MonthlyExecution execution = acc.getMonthlyExecution();
        execution.setStatus(MonthlyExecutionStatus.ACCOUNTABILITY_DRAFT);
        executionRepository.save(execution);
    }
}
