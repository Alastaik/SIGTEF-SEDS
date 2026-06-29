package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.ImportBatchDTO;
import br.gov.go.seds.sigtef.dto.ImportRequestDTO;
import br.gov.go.seds.sigtef.service.ImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/imports")
@RequiredArgsConstructor
public class ImportController {

    private final ImportService importService;

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ImportBatchDTO> uploadFile(@ModelAttribute ImportRequestDTO request) {
        ImportBatchDTO batch = importService.uploadFileAndCreateBatch(
                request.getImportType(),
                request.getMode(),
                request.getFile()
        );
        return ResponseEntity.ok(batch);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ImportBatchDTO>> listBatches() {
        return ResponseEntity.ok(importService.findAllBatches());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ImportBatchDTO> getBatch(@PathVariable UUID id) {
        return ResponseEntity.ok(importService.findBatchById(id));
    }
}
