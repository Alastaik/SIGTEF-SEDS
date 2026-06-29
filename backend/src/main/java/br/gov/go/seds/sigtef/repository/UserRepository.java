package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    java.util.List<User> findByUserType(String userType);
}
