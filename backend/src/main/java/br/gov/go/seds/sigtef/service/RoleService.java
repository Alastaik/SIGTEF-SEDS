package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.RoleResponse;
import br.gov.go.seds.sigtef.model.Permission;
import br.gov.go.seds.sigtef.model.Role;
import br.gov.go.seds.sigtef.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final br.gov.go.seds.sigtef.repository.PermissionRepository permissionRepository;

    @Transactional(readOnly = true)
    public List<RoleResponse> findAll() {
        return roleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private RoleResponse mapToResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .permissions(role.getPermissions().stream().map(Permission::getName).collect(Collectors.toSet()))
                .build();
    }

    @Transactional
    public RoleResponse updateRole(UUID id, java.util.Set<String> permissionNames) {
        Role role = roleRepository.findById(id).orElseThrow(() -> new RuntimeException("Role not found"));
        
        java.util.List<Permission> newPermissions = permissionRepository.findByNameIn(permissionNames);
        role.setPermissions(new java.util.HashSet<>(newPermissions));
        
        return mapToResponse(roleRepository.save(role));
    }
}
