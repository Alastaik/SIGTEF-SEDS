package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.model.Region;
import br.gov.go.seds.sigtef.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionRepository repository;

    @GetMapping
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Region>> findAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Region> create(@RequestBody Region region) {
        return ResponseEntity.ok(repository.save(region));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Region> update(@PathVariable UUID id, @RequestBody Region region) {
        region.setId(id);
        return ResponseEntity.ok(repository.save(region));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_GESTOR')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
