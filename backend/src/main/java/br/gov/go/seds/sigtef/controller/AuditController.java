package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.AuditLogDTO;
import br.gov.go.seds.sigtef.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogDTO>> getRecentRevisions(
            @RequestParam(defaultValue = "100") int limit) {
        
        // Limita a busca em no máximo 500 registros para não sobrecarregar
        if (limit > 500) limit = 500;
        
        List<AuditLogDTO> logs = auditService.getRecentRevisions(limit);
        return ResponseEntity.ok(logs);
    }
}
