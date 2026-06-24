package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.model.SystemTemplate;
import br.gov.go.seds.sigtef.service.SystemTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class SystemTemplateController {

    private final SystemTemplateService service;

    @GetMapping
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<List<SystemTemplate>> getAllTemplates() {
        return ResponseEntity.ok(service.findAll());
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasRole('ADMIN')")
    public ResponseEntity<SystemTemplate> updateTemplate(
            @PathVariable String key,
            @RequestBody UpdateTemplateDto dto) {
        return ResponseEntity.ok(service.updateTemplate(key, dto.subject(), dto.content()));
    }

    public record UpdateTemplateDto(String subject, String content) {}
}
