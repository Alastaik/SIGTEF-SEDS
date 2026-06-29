package br.gov.go.seds.sigtef.security;

import br.gov.go.seds.sigtef.model.Role;
import br.gov.go.seds.sigtef.model.User;

import br.gov.go.seds.sigtef.repository.RoleRepository;
import br.gov.go.seds.sigtef.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Garantir que a conta .gov.br exista
        if (!userRepository.existsByEmail("admin@sigtef.gov.br")) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("Role ADMIN not found"));

            User adminGov = User.builder()
                    .name("Administrador do Sistema")
                    .email("admin@sigtef.gov.br")
                    .password(passwordEncoder.encode("admin123"))
                    .userType("INTERNO")
                    .active(true)
                    .roles(Set.of(adminRole))
                    .build();

            userRepository.save(adminGov);
        }

        // Garantir que a conta .com.br solicitada exista e tenha a senha correta
        User adminCom = userRepository.findByEmail("admin@sigtef.com.br").orElse(null);
        if (adminCom == null) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("Role ADMIN not found"));
            
            adminCom = User.builder()
                    .name("Administrador do Sistema (COM)")
                    .email("admin@sigtef.com.br")
                    .password(passwordEncoder.encode("123456"))
                    .userType("INTERNO")
                    .active(true)
                    .roles(Set.of(adminRole))
                    .build();
            userRepository.save(adminCom);
            
            System.out.println("==========================================");
            System.out.println(" Conta ADMIN criada automaticamente:");
            System.out.println(" E-mail: admin@sigtef.com.br");
            System.out.println(" Senha: 123456");
            System.out.println("==========================================");
        } else {
            // Se já existir (devido a migration), atualizamos a senha só para garantir
            adminCom.setPassword(passwordEncoder.encode("123456"));
            adminCom.setFailedLoginAttempts(0);
            adminCom.setLockedUntil(null);
            adminCom.setActive(true);
            userRepository.save(adminCom);
        }
    }
}
