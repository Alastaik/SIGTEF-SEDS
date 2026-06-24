package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.LoginRequest;
import br.gov.go.seds.sigtef.dto.UserInfoResponse;
import br.gov.go.seds.sigtef.security.JwtUtils;
import br.gov.go.seds.sigtef.security.UserDetailsImpl;
import br.gov.go.seds.sigtef.service.PasswordResetService;
import br.gov.go.seds.sigtef.service.SystemSettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import br.gov.go.seds.sigtef.repository.UserRepository;
import br.gov.go.seds.sigtef.model.User;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordResetService passwordResetService;
    private final SystemSettingService settingService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        } catch (BadCredentialsException e) {
            handleFailedLogin(loginRequest.getEmail());
            return ResponseEntity.status(401).body("Credenciais inválidas");
        } catch (LockedException e) {
            return ResponseEntity.status(401).body("Conta temporariamente bloqueada. Tente novamente mais tarde.");
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Erro ao autenticar: " + e.getMessage());
        }

        // Sucesso: zerar as tentativas
        handleSuccessfulLogin(loginRequest.getEmail());

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

        List<String> authorities = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(new UserInfoResponse(
                        userDetails.getId(),
                        userDetails.getName(),
                        userDetails.getEmail(),
                        userDetails.getUserType(),
                        authorities,
                        userDetails.getAllowedEntities()
                ));
    }

    private void handleFailedLogin(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            
            int maxAttempts = Integer.parseInt(settingService.getValueOrDefault("seguranca.max_login_attempts", "5"));
            if (attempts >= maxAttempts) {
                int lockoutMinutes = Integer.parseInt(settingService.getValueOrDefault("seguranca.lockout_duration_minutes", "15"));
                user.setLockedUntil(LocalDateTime.now().plusMinutes(lockoutMinutes));
            }
            userRepository.save(user);
        }
    }

    private void handleSuccessfulLogin(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getFailedLoginAttempts() > 0 || user.getLockedUntil() != null) {
                user.setFailedLoginAttempts(0);
                user.setLockedUntil(null);
                userRepository.save(user);
            }
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        ResponseCookie cookie = jwtUtils.getCleanJwtCookie();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Logout realizado com sucesso!");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            return ResponseEntity.status(401).body("Não autenticado");
        }
        
        List<String> authorities = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new UserInfoResponse(
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getEmail(),
                userDetails.getUserType(),
                authorities,
                userDetails.getAllowedEntities()
        ));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        if (email != null && !email.isBlank()) {
            passwordResetService.requestPasswordReset(email);
        }
        // Sempre retorna sucesso genérico por segurança
        return ResponseEntity.ok("Se o e-mail existir, um link de redefinição será enviado.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body("Token e nova senha são obrigatórios.");
        }

        boolean success = passwordResetService.resetPassword(token, newPassword);
        if (success) {
            return ResponseEntity.ok("Senha redefinida com sucesso.");
        } else {
            return ResponseEntity.badRequest().body("Token inválido ou expirado.");
        }
    }
}
