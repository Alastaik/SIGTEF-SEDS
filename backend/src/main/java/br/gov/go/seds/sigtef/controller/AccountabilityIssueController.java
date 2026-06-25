package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.*;
import br.gov.go.seds.sigtef.service.AccountabilityIssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accountabilities/{accountabilityId}/issues")
@RequiredArgsConstructor
public class AccountabilityIssueController {

    private final AccountabilityIssueService issueService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SEDS', 'ENTITY')")
    public ResponseEntity<List<AccountabilityIssueDTO>> getIssues(@PathVariable UUID accountabilityId) {
        return ResponseEntity.ok(issueService.getIssuesByAccountability(accountabilityId));
    }

    @PostMapping
    @PreAuthorize("hasRole('SEDS')")
    public ResponseEntity<AccountabilityIssueDTO> createIssue(@PathVariable UUID accountabilityId,
                                                              @RequestBody IssueCreateDTO dto) {
        return ResponseEntity.ok(issueService.createIssue(accountabilityId, dto));
    }

    @PostMapping("/notify")
    @PreAuthorize("hasRole('SEDS')")
    public ResponseEntity<Void> notifyIssues(@PathVariable UUID accountabilityId) {
        issueService.notifyIssues(accountabilityId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{issueId}/cancel")
    @PreAuthorize("hasRole('SEDS')")
    public ResponseEntity<AccountabilityIssueDTO> cancelIssue(@PathVariable UUID accountabilityId,
                                                              @PathVariable UUID issueId,
                                                              @RequestBody String reason) {
        return ResponseEntity.ok(issueService.cancelIssue(issueId, reason));
    }

    @PostMapping("/{issueId}/responses")
    @PreAuthorize("hasRole('ENTITY')")
    public ResponseEntity<AccountabilityIssueDTO> submitResponse(@PathVariable UUID accountabilityId,
                                                                 @PathVariable UUID issueId,
                                                                 @RequestBody IssueResponseCreateDTO dto) {
        return ResponseEntity.ok(issueService.submitResponse(issueId, dto));
    }

    @PostMapping("/{issueId}/responses/{responseId}/review")
    @PreAuthorize("hasRole('SEDS')")
    public ResponseEntity<AccountabilityIssueDTO> reviewResponse(@PathVariable UUID accountabilityId,
                                                                 @PathVariable UUID issueId,
                                                                 @PathVariable UUID responseId,
                                                                 @RequestBody IssueReviewDTO dto) {
        return ResponseEntity.ok(issueService.reviewResponse(issueId, responseId, dto));
    }
}
