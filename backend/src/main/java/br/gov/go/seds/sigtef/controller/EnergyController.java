package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.energy.EnergyDashboardDTO;
import br.gov.go.seds.sigtef.dto.energy.EnergyRecordDTO;
import br.gov.go.seds.sigtef.dto.energy.GlobalEnergyDashboardDTO;
import br.gov.go.seds.sigtef.service.EnergyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/energy")
@RequiredArgsConstructor
public class EnergyController {

    private final EnergyService energyService;

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
}
