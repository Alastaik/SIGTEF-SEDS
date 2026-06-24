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
        if (!userRepository.existsByEmail("admin@sigtef.gov.br")) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("Role ADMIN not found"));

            User admin = User.builder()
                    .name("Administrador do Sistema")
                    .email("admin@sigtef.gov.br")
                    .password(passwordEncoder.encode("admin123"))
                    .userType("INTERNO")
                    .active(true)
                    .roles(Set.of(adminRole))
                    .build();

            userRepository.save(admin);
            System.out.println("==========================================");
            System.out.println(" Conta ADMIN criada automaticamente:");
            System.out.println(" E-mail: admin@sigtef.gov.br");
            System.out.println(" Senha: admin123");
            System.out.println("==========================================");
        }
    }
}
