package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.model.Program;
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
}
