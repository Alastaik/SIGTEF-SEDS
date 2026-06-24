package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.model.IssueType;
import br.gov.go.seds.sigtef.repository.IssueTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/issue-types")
@RequiredArgsConstructor
public class IssueTypeController {

    private final IssueTypeRepository repository;

    @GetMapping
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<IssueType>> findAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<IssueType> create(@RequestBody IssueType entity) {
        return ResponseEntity.ok(repository.save(entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<IssueType> update(@PathVariable UUID id, @RequestBody IssueType entity) {
        entity.setId(id);
        return ResponseEntity.ok(repository.save(entity));
    }
}
