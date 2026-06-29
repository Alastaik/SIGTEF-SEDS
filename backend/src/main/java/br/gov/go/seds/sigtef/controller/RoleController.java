package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.RoleResponse;
import br.gov.go.seds.sigtef.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;
    private final br.gov.go.seds.sigtef.repository.PermissionRepository permissionRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(roleService.findAll());
    }

    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<String>> getAllPermissions() {
        return ResponseEntity.ok(
                permissionRepository.findAll().stream().map(br.gov.go.seds.sigtef.model.Permission::getName).toList()
        );
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<RoleResponse> updateRole(
            @org.springframework.web.bind.annotation.PathVariable java.util.UUID id,
            @org.springframework.web.bind.annotation.RequestBody java.util.Set<String> permissionNames) {
        return ResponseEntity.ok(roleService.updateRole(id, permissionNames));
    }
}
