package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.model.*;
import br.gov.go.seds.sigtef.service.AccountabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/accountabilities")
@RequiredArgsConstructor
public class AccountabilityController {

    private final AccountabilityService service;

    @PostMapping("/start/{executionId}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ENTIDADE')")
    public ResponseEntity<Accountability> startDraft(@PathVariable UUID executionId, @AuthenticationPrincipal br.gov.go.seds.sigtef.security.UserDetailsImpl user) {
        return ResponseEntity.ok(service.startDraft(executionId, user.getId()));
    }

    @PostMapping("/executions/{executionId}/documents")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ENTIDADE')")
    public ResponseEntity<FiscalDocument> addDocument(
            @PathVariable UUID executionId, 
            @RequestBody FiscalDocument document) {
        return ResponseEntity.ok(service.addFiscalDocumentByExecution(executionId, document));
    }

    @PutMapping("/executions/{executionId}/documents/{documentId}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ENTIDADE')")
    public ResponseEntity<FiscalDocument> updateDocument(
            @PathVariable UUID documentId, 
            @RequestBody FiscalDocument document) {
        return ResponseEntity.ok(service.updateFiscalDocument(documentId, document));
    }

    @PostMapping("/executions/{executionId}/submit")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ENTIDADE')")
    public ResponseEntity<Accountability> submitByExecution(@PathVariable UUID executionId, @AuthenticationPrincipal br.gov.go.seds.sigtef.security.UserDetailsImpl user) {
        return ResponseEntity.ok(service.submitByExecution(executionId, user.getId()));
    }

    @GetMapping("/executions/{executionId}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ENTIDADE') or hasAuthority('ROLE_SEDS')")
    public ResponseEntity<br.gov.go.seds.sigtef.model.AccountabilitySubmission> getSubmission(@PathVariable UUID executionId) {
        return ResponseEntity.ok(service.getSubmissionByExecution(executionId));
    }

    @GetMapping("/executions/{executionId}/latest-review")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ENTIDADE') or hasAuthority('ROLE_SEDS')")
    public ResponseEntity<AccountabilityReview> getLatestReview(@PathVariable UUID executionId) {
        AccountabilityReview review = service.getLatestReviewByExecution(executionId);
        if (review == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(review);
    }

    @PostMapping("/executions/{executionId}/analyze")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SEDS')")
    public ResponseEntity<br.gov.go.seds.sigtef.model.AccountabilityReview> analyzeExecution(
            @PathVariable UUID executionId,
            @RequestBody br.gov.go.seds.sigtef.dto.AccountabilityReviewRequestDTO request,
            @AuthenticationPrincipal br.gov.go.seds.sigtef.security.UserDetailsImpl userDetails) {
        // Obter o usuário a partir do ID
        User reviewer = new User();
        reviewer.setId(userDetails.getId());
        return ResponseEntity.ok(service.reviewByExecution(executionId, request, reviewer));
    }

    @PutMapping("/executions/{executionId}/documents/{documentId}/review")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SEDS')")
    public ResponseEntity<FiscalDocument> reviewFiscalDocument(
            @PathVariable UUID executionId,
            @PathVariable UUID documentId,
            @RequestBody br.gov.go.seds.sigtef.dto.DocumentReviewRequestDTO request) {
        return ResponseEntity.ok(service.reviewFiscalDocument(documentId, request));
    }
}
