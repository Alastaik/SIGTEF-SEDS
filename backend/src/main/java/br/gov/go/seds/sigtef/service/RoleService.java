package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.RoleResponse;
import br.gov.go.seds.sigtef.model.Permission;
import br.gov.go.seds.sigtef.model.Role;
import br.gov.go.seds.sigtef.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

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
}
