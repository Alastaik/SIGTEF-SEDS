package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.admin.AdminDashboardDTO;
import br.gov.go.seds.sigtef.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/general")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<AdminDashboardDTO> getGeneralDashboard() {
        return ResponseEntity.ok(dashboardService.getGeneralDashboard());
    }

    @GetMapping("/delayed-entities")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<java.util.List<br.gov.go.seds.sigtef.dto.admin.DelayedEntityDTO>> getDelayedEntities() {
        return ResponseEntity.ok(dashboardService.getDelayedEntities());
    }
}
