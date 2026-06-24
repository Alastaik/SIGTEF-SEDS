package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.model.DomainData;
import br.gov.go.seds.sigtef.repository.DomainDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/domain-data")
@RequiredArgsConstructor
public class DomainDataController {

    private final DomainDataRepository repository;

    @GetMapping
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<DomainData>> findAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/type/{domainType}")
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<DomainData>> findByType(@PathVariable String domainType) {
        return ResponseEntity.ok(repository.findByDomainType(domainType));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DomainData> create(@RequestBody DomainData entity) {
        return ResponseEntity.ok(repository.save(entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DomainData> update(@PathVariable UUID id, @RequestBody DomainData entity) {
        entity.setId(id);
        return ResponseEntity.ok(repository.save(entity));
    }
}
