package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.GlobalEnergyTariffFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GlobalEnergyTariffFlagRepository extends JpaRepository<GlobalEnergyTariffFlag, UUID> {
    Optional<GlobalEnergyTariffFlag> findByCompetenceId(UUID competenceId);
}
