package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.model.Program;
import br.gov.go.seds.sigtef.model.ProgramDocumentRequirement;
import br.gov.go.seds.sigtef.model.ProgramValueTable;
import br.gov.go.seds.sigtef.service.ProgramService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/programs")
@RequiredArgsConstructor
public class ProgramController {

    private final ProgramService programService;

    @GetMapping
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Program>> findAll() {
        return ResponseEntity.ok(programService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Program> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(programService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Program> create(@RequestBody Program program) {
        return ResponseEntity.ok(programService.save(program));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Program> update(@PathVariable UUID id, @RequestBody Program program) {
        program.setId(id);
        return ResponseEntity.ok(programService.save(program));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_GESTOR')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        programService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/values")
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<ProgramValueTable>> findValues(@PathVariable UUID id) {
        return ResponseEntity.ok(programService.findValuesByProgram(id));
    }

    @PostMapping("/{id}/values")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ProgramValueTable> addValue(@PathVariable UUID id, @RequestBody ProgramValueTable value) {
        return ResponseEntity.ok(programService.saveValueTable(id, value));
    }

    @PutMapping("/{id}/values/{valueId}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ProgramValueTable> updateValue(@PathVariable UUID id, @PathVariable UUID valueId, @RequestBody ProgramValueTable value) {
        value.setId(valueId);
        return ResponseEntity.ok(programService.saveValueTable(id, value));
    }

    @DeleteMapping("/{id}/values/{valueId}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteValue(@PathVariable UUID id, @PathVariable UUID valueId) {
        programService.deleteValueTable(valueId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/documents")
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<ProgramDocumentRequirement>> findDocumentRequirements(@PathVariable UUID id) {
        return ResponseEntity.ok(programService.findDocumentRequirements(id));
    }

    @PostMapping("/{id}/documents")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ProgramDocumentRequirement> addDocumentRequirement(@PathVariable UUID id, @RequestBody ProgramDocumentRequirement requirement) {
        return ResponseEntity.ok(programService.saveDocumentRequirement(id, requirement));
    }

    @PutMapping("/{id}/documents/{reqId}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ProgramDocumentRequirement> updateDocumentRequirement(@PathVariable UUID id, @PathVariable UUID reqId, @RequestBody ProgramDocumentRequirement requirement) {
        requirement.setId(reqId);
        return ResponseEntity.ok(programService.saveDocumentRequirement(id, requirement));
    }

    @DeleteMapping("/{id}/documents/{reqId}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteDocumentRequirement(@PathVariable UUID id, @PathVariable UUID reqId) {
        programService.deleteDocumentRequirement(reqId);
        return ResponseEntity.noContent().build();
    }
}
