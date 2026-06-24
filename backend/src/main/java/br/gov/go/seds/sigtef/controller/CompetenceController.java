package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.model.Competence;
import br.gov.go.seds.sigtef.model.CompetenceReopening;
import br.gov.go.seds.sigtef.model.enums.CompetenceStatus;
import br.gov.go.seds.sigtef.security.UserDetailsImpl;
import br.gov.go.seds.sigtef.service.CompetenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/competences")
@RequiredArgsConstructor
public class CompetenceController {

    private final CompetenceService service;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Competence>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasRole('ADMIN')")
    public ResponseEntity<Competence> create(@RequestBody CreateCompetenceDto dto) {
        return ResponseEntity.ok(service.create(dto.month(), dto.year()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasRole('ADMIN')")
    public ResponseEntity<Competence> changeStatus(
            @PathVariable UUID id,
            @RequestBody ChangeStatusDto dto) {
        return ResponseEntity.ok(service.changeStatus(id, dto.status()));
    }

    @PostMapping("/{id}/reopen")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasRole('ADMIN')")
    public ResponseEntity<CompetenceReopening> reopen(
            @PathVariable UUID id,
            @RequestBody ReopenDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(service.reopen(id, userDetails.getId(), dto.reason()));
    }

    public record CreateCompetenceDto(Integer month, Integer year) {}
    public record ChangeStatusDto(CompetenceStatus status) {}
    public record ReopenDto(String reason) {}
}
