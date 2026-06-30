package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.UserCreateRequest;
import br.gov.go.seds.sigtef.dto.UserResponse;
import br.gov.go.seds.sigtef.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('usuarios:visualizar') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('usuarios:criar') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(userService.create(request));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('usuarios:inativar') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserResponse> toggleActive(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.toggleActive(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('usuarios:excluir') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
