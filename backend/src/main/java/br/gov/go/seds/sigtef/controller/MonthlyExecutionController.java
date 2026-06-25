package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.model.MonthlyExecution;
import br.gov.go.seds.sigtef.service.MonthlyExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/monthly-executions")
@RequiredArgsConstructor
public class MonthlyExecutionController {

    private final MonthlyExecutionService service;

    @GetMapping
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_GESTOR')")
    public ResponseEntity<Page<MonthlyExecution>> findByFilters(
            @RequestParam(required = false) String competence,
            @RequestParam(required = false) UUID legalEntityId,
            @RequestParam(required = false) UUID programId,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(service.findByFilters(competence, legalEntityId, programId, status, pageable));
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_GESTOR')")
    public ResponseEntity<Map<String, Object>> generate(@RequestBody Map<String, String> request) {
        String competence = request.get("competence");
        if (competence == null || competence.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Competence is required (YYYY-MM)"));
        }
        int count = service.generateForCompetence(competence);
        return ResponseEntity.ok(Map.of("generated", count, "competence", competence));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_GESTOR')")
    public ResponseEntity<MonthlyExecution> update(@PathVariable UUID id, @RequestBody MonthlyExecution execution) {
        execution.setId(id);
        return ResponseEntity.ok(service.save(execution));
    }

    @PostMapping("/{id}/block")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_GESTOR')")
    public ResponseEntity<MonthlyExecution> block(@PathVariable UUID id, @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        return ResponseEntity.ok(service.block(id, reason));
    }

    @PostMapping("/{id}/unblock")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_GESTOR')")
    public ResponseEntity<MonthlyExecution> unblock(@PathVariable UUID id) {
        return ResponseEntity.ok(service.unblock(id));
    }

    @PostMapping("/{id}/transfer")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_GESTOR')")
    public ResponseEntity<MonthlyExecution> registerTransfer(@PathVariable UUID id, @RequestBody Map<String, Object> request) {
        java.math.BigDecimal value = null;
        if (request.containsKey("transferredValue") && request.get("transferredValue") != null) {
            value = new java.math.BigDecimal(request.get("transferredValue").toString());
        }
        
        LocalDate date = null;
        if (request.containsKey("transferDate") && request.get("transferDate") != null) {
            date = LocalDate.parse(request.get("transferDate").toString());
        }
        
        return ResponseEntity.ok(service.registerTransfer(id, value, date));
    }

    @PostMapping("/transfer-batch")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_GESTOR')")
    public ResponseEntity<Integer> registerBatchTransfer(@RequestBody Map<String, Object> request) {
        List<String> idsStr = (List<String>) request.get("executionIds");
        List<UUID> ids = idsStr.stream().map(UUID::fromString).toList();

        LocalDate date = null;
        if (request.containsKey("transferDate") && request.get("transferDate") != null) {
            date = LocalDate.parse(request.get("transferDate").toString());
        }

        int count = service.registerBatchTransfer(ids, date);
        return ResponseEntity.ok(count);
    }
}
