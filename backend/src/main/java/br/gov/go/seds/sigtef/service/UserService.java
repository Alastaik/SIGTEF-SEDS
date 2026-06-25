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
    public void delete(UUID id) {
        // By default, if user is referenced in other tables (created_by, updated_by), it will throw constraint exception.
        // Usually we don't hard delete users. But since we are adding it for Admin:
        userRepository.deleteById(id);
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
