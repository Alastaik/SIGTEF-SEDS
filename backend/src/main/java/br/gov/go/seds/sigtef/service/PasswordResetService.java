package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.model.User;
import br.gov.go.seds.sigtef.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public void requestPasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = UUID.randomUUID().toString();
            
            user.setResetToken(token);
            user.setResetTokenExpiresAt(LocalDateTime.now().plusHours(2));
            userRepository.save(user);

            // TODO: Use application frontend URL (e.g. from properties)
            String resetLink = "http://localhost:5173/reset-password?token=" + token;
            emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
        }
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<User> userOpt = userRepository.findByResetToken(token);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            if (user.getResetTokenExpiresAt() != null && user.getResetTokenExpiresAt().isAfter(LocalDateTime.now())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetToken(null);
                user.setResetTokenExpiresAt(null);
                
                // Unlock account if it was locked
                user.setFailedLoginAttempts(0);
                user.setLockedUntil(null);
                
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }
}
