package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.service.BackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/admin/backup")
@RequiredArgsConstructor
public class BackupController {

    private final BackupService backupService;

    @PostMapping("/manual")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> triggerManualBackup() {
        // Dispara assíncrono para não travar a requisição HTTP caso demore
        backupService.executeManualBackup();
        
        return ResponseEntity.accepted().body(Map.of(
            "message", "A rotina de backup foi disparada com sucesso. Verifique os logs para acompanhamento."
        ));
    }
}
