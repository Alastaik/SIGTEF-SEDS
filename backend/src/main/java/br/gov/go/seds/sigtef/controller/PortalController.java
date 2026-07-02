package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.portal.PortalDashboardDTO;
import br.gov.go.seds.sigtef.dto.portal.PortalEntityDTO;
import br.gov.go.seds.sigtef.security.UserDetailsImpl;
import br.gov.go.seds.sigtef.service.PortalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
public class PortalController {

    private final PortalService portalService;

    @GetMapping("/my-entities")
    public ResponseEntity<List<PortalEntityDTO>> getMyEntities(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(portalService.getMyEntities(userDetails.getId()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<PortalDashboardDTO> getDashboard(
            @RequestHeader(value = "X-Entity-Id", required = false) UUID entityId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        if (entityId == null) {
            return ResponseEntity.badRequest().build();
        }

        // Idealmente veriificaríamos se userDetails.getId() tem acesso a esse entityId.
        
        return ResponseEntity.ok(portalService.getDashboard(entityId));
    }

    @GetMapping("/competences")
    public ResponseEntity<org.springframework.data.domain.Page<br.gov.go.seds.sigtef.model.MonthlyExecution>> getCompetences(
            @RequestHeader(value = "X-Entity-Id", required = false) UUID entityId,
            @RequestParam(required = false) String competence,
            @RequestParam(required = false) String status,
            org.springframework.data.domain.Pageable pageable) {
        
        if (entityId == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(portalService.getCompetences(entityId, competence, status, pageable));
    }

    @GetMapping("/competences/{id}")
    public ResponseEntity<br.gov.go.seds.sigtef.model.MonthlyExecution> getCompetenceById(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Entity-Id", required = false) UUID entityId) {
        
        if (entityId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            br.gov.go.seds.sigtef.model.MonthlyExecution execution = portalService.getCompetenceById(id, entityId);
            return ResponseEntity.ok(execution);
        } catch (Exception e) {
            return ResponseEntity.status(403).build(); // If not found by ID+EntityID, it's forbidden or not found. We return 403 to match previous behavior or 404.
        }
    }

    @GetMapping("/agreements")
    public ResponseEntity<List<br.gov.go.seds.sigtef.model.PartnershipAgreement>> getAgreements(
            @RequestHeader(value = "X-Entity-Id", required = false) UUID entityId) {
        
        if (entityId == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(portalService.getAgreements(entityId));
    }
    @GetMapping("/issues")
    public ResponseEntity<List<br.gov.go.seds.sigtef.model.AccountabilityIssue>> getIssues(
            @RequestHeader(value = "X-Entity-Id", required = false) UUID entityId) {
        
        if (entityId == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(portalService.getIssues(entityId));
    }

    @PostMapping("/issues/{issueId}/respond")
    public ResponseEntity<br.gov.go.seds.sigtef.model.AccountabilityIssueResponse> respondIssue(
            @RequestHeader(value = "X-Entity-Id", required = false) UUID entityId,
            @PathVariable UUID issueId,
            @RequestBody java.util.Map<String, String> payload) {
        
        if (entityId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        String responseText = payload.get("responseText");
        if (responseText == null || responseText.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(portalService.respondIssue(entityId, issueId, responseText));
    }

    @GetMapping("/accountabilities/{id}/timeline")
    public ResponseEntity<List<br.gov.go.seds.sigtef.dto.TimelineEventDTO>> getAccountabilityTimeline(
            @RequestHeader(value = "X-Entity-Id", required = false) UUID entityId,
            @PathVariable UUID id) {
        
        if (entityId == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(portalService.getAccountabilityTimeline(id));
    }
}
