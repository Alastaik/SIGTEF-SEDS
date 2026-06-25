package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.Accountability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountabilityRepository extends JpaRepository<Accountability, UUID> {
    Optional<Accountability> findByMonthlyExecutionId(UUID monthlyExecutionId);
}
