package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.UserCreateRequest;
import br.gov.go.seds.sigtef.dto.UserResponse;
import br.gov.go.seds.sigtef.model.Role;
import br.gov.go.seds.sigtef.model.User;
import br.gov.go.seds.sigtef.model.LegalEntityRepresentative;
import br.gov.go.seds.sigtef.repository.RoleRepository;
import br.gov.go.seds.sigtef.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("E-mail já está em uso.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setUserType(request.getUserType());
        user.setActive(request.getActive());

        validateRoleAssignment(request.getRoleIds());

        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            List<Role> roles = roleRepository.findAllById(request.getRoleIds());
            user.setRoles(new HashSet<>(roles));
        }

        // Entity Scopes are now managed by LegalEntityRepresentative and invitations
        // in RepresentativeController/Service.

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Transactional
    public UserResponse update(UUID id, br.gov.go.seds.sigtef.dto.UserUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        validateHierarchy(user);
        validateRoleAssignment(request.getRoleIds());

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("E-mail já está em uso por outro usuário.");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setUserType(request.getUserType());
        user.setActive(request.getActive());

        if (request.getRoleIds() != null) {
            List<Role> roles = roleRepository.findAllById(request.getRoleIds());
            user.setRoles(new HashSet<>(roles));
        } else {
            user.getRoles().clear();
        }

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Transactional
    public UserResponse toggleActive(UUID id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
            
        validateHierarchy(user);
        
        user.setActive(!user.getActive());
        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Transactional
    public void delete(UUID id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
            
        validateHierarchy(user);
        
        // By default, if user is referenced in other tables (created_by, updated_by), it will throw constraint exception.
        // Usually we don't hard delete users. But since we are adding it for Admin:
        userRepository.deleteById(id);
    }

    private int getRoleRank(String roleName) {
        switch (roleName) {
            case "ROLE_ADMIN": return 100;
            case "ROLE_GESTOR": return 80;
            case "ROLE_ANALISTA": return 60;
            case "ROLE_REPRESENTANTE": return 40;
            default: return 0;
        }
    }

    private int getUserRank(java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities) {
        int maxRank = 0;
        for (org.springframework.security.core.GrantedAuthority authority : authorities) {
            int rank = getRoleRank(authority.getAuthority());
            if (rank > maxRank) {
                maxRank = rank;
            }
        }
        return maxRank;
    }

    private int getUserRank(Set<Role> roles) {
        int maxRank = 0;
        for (Role role : roles) {
            int rank = getRoleRank(role.getName());
            if (rank > maxRank) {
                maxRank = rank;
            }
        }
        return maxRank;
    }

    private void validateHierarchy(User targetUser) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return;
        
        int currentUserRank = getUserRank(auth.getAuthorities());
        int targetUserRank = getUserRank(targetUser.getRoles());
        
        if (currentUserRank < targetUserRank) {
            throw new org.springframework.security.access.AccessDeniedException("Você não tem permissão para modificar um usuário de cargo superior.");
        }
    }

    private void validateRoleAssignment(Set<UUID> requestedRoleIds) {
        if (requestedRoleIds == null || requestedRoleIds.isEmpty()) return;
        
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return;
        
        int currentUserRank = getUserRank(auth.getAuthorities());
        List<Role> requestedRoles = roleRepository.findAllById(requestedRoleIds);
        int requestedMaxRank = getUserRank(new HashSet<>(requestedRoles));
        
        if (currentUserRank < requestedMaxRank) {
            throw new org.springframework.security.access.AccessDeniedException("Você não pode atribuir um cargo superior ao seu.");
        }
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .userType(user.getUserType())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .entityScopes(user.getRepresentatives().stream().map(rep -> rep.getLegalEntity().getId()).collect(Collectors.toSet()))
                .build();
    }
}
