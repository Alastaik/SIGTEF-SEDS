package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.model.SystemSetting;
import br.gov.go.seds.sigtef.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService service;

    @GetMapping
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<List<SystemSetting>> getAllSettings() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<List<SystemSetting>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(service.findByCategory(category.toUpperCase()));
    }

    @PutMapping
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasRole('ADMIN')")
    public ResponseEntity<Void> updateSettings(@RequestBody Map<String, String> updates) {
        service.updateSettings(updates);
        return ResponseEntity.ok().build();
    }
}
