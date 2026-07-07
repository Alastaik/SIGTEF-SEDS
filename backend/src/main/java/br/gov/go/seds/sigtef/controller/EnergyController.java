package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.energy.EnergyDashboardDTO;
import br.gov.go.seds.sigtef.dto.energy.EnergyRecordDTO;
import br.gov.go.seds.sigtef.dto.energy.GlobalEnergyDashboardDTO;
import br.gov.go.seds.sigtef.service.EnergyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import br.gov.go.seds.sigtef.service.ExportService;

import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/energy")
@RequiredArgsConstructor
public class EnergyController {

    private final EnergyService energyService;
    private final ExportService exportService;

    @PostMapping("/records")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<EnergyRecordDTO> saveRecord(@RequestBody EnergyRecordDTO dto) {
        return ResponseEntity.ok(energyService.saveRecord(dto));
    }

    @GetMapping("/records")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<List<EnergyRecordDTO>> getRecordsByEntity(@RequestParam UUID entityId) {
        return ResponseEntity.ok(energyService.getRecordsByEntity(entityId));
    }

    @DeleteMapping("/records/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<Void> deleteRecord(@PathVariable UUID id) {
        energyService.deleteRecord(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard/{entityId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<EnergyDashboardDTO> getEntityDashboard(
            @PathVariable UUID entityId,
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(energyService.getEntityDashboard(entityId, months));
    }

    @GetMapping("/dashboard/global")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<GlobalEnergyDashboardDTO> getGlobalDashboard(
            @RequestParam int year) {
        return ResponseEntity.ok(energyService.getGlobalDashboard(year));
    }

    @GetMapping("/reports/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<byte[]> exportEnergyRecords(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) UUID entityId) {
        
        List<EnergyRecordDTO> records = energyService.getAllRecordsForExport(year, entityId);
        byte[] csvBytes = exportService.exportEnergyRecordsToCsv(records);

        String filename = "consumo_energia_" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .body(csvBytes);
    }
}
