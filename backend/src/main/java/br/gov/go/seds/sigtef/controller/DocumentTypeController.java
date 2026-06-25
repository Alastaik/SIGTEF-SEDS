package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.model.DocumentType;
import br.gov.go.seds.sigtef.repository.DocumentTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/document-types")
@RequiredArgsConstructor
public class DocumentTypeController {

    private final DocumentTypeRepository repository;

    @GetMapping
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<DocumentType>> findAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DocumentType> create(@RequestBody DocumentType entity) {
        return ResponseEntity.ok(repository.save(entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DocumentType> update(@PathVariable UUID id, @RequestBody DocumentType entity) {
        entity.setId(id);
        return ResponseEntity.ok(repository.save(entity));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_GESTOR')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
