package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.model.*;
import br.gov.go.seds.sigtef.model.enums.EntityStatus;
import br.gov.go.seds.sigtef.repository.UserRepository;
import br.gov.go.seds.sigtef.service.LegalEntityService;
import br.gov.go.seds.sigtef.dto.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/entities")
@RequiredArgsConstructor
public class LegalEntityController {

    private final LegalEntityService legalEntityService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('entidades:visualizar') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<LegalEntity>> getAllEntities() {
        return ResponseEntity.ok(legalEntityService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('entidades:visualizar') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LegalEntity> getEntityById(@PathVariable UUID id) {
        return legalEntityService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('entidades:criar') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LegalEntity> createEntity(@RequestBody LegalEntity entity) {
        User creator = getCurrentUser();
        LegalEntity saved = legalEntityService.create(entity, creator);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('entidades:editar') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LegalEntity> changeStatus(
            @PathVariable UUID id,
            @RequestParam EntityStatus status,
            @RequestParam String reason) {
        User user = getCurrentUser();
        LegalEntity updated = legalEntityService.changeStatus(id, status, user, reason);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_GESTOR')")
    public ResponseEntity<?> deleteEntity(@PathVariable UUID id) {
        try {
            legalEntityService.deleteEntity(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/{id}/addresses")
    @PreAuthorize("hasAuthority('entidades:editar') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LegalEntityAddress> addAddress(@PathVariable UUID id, @RequestBody AddressRequestDTO dto) {
        return ResponseEntity.ok(legalEntityService.addAddress(id, dto, getCurrentUser()));
    }

    @PostMapping("/{id}/contacts")
    @PreAuthorize("hasAuthority('entidades:editar') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LegalEntityContact> addContact(@PathVariable UUID id, @RequestBody ContactRequestDTO dto) {
        return ResponseEntity.ok(legalEntityService.addContact(id, dto, getCurrentUser()));
    }

    @PostMapping("/{id}/responsibles")
    @PreAuthorize("hasAuthority('entidades:editar') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LegalEntityResponsible> addResponsible(@PathVariable UUID id, @RequestBody ResponsibleRequestDTO dto) {
        return ResponseEntity.ok(legalEntityService.addResponsible(id, dto, getCurrentUser()));
    }

    @PostMapping("/{id}/consumer-units")
    @PreAuthorize("hasAuthority('entidades:editar') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LegalEntityConsumerUnit> addConsumerUnit(@PathVariable UUID id, @RequestBody ConsumerUnitRequestDTO dto) {
        return ResponseEntity.ok(legalEntityService.addConsumerUnit(id, dto, getCurrentUser()));
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasAuthority('entidades:editar') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LegalEntityNote> addNote(@PathVariable UUID id, @RequestBody NoteRequestDTO dto) {
        return ResponseEntity.ok(legalEntityService.addNote(id, dto, getCurrentUser()));
    }
}
