package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.LegalEntityConsumerUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LegalEntityConsumerUnitRepository extends JpaRepository<LegalEntityConsumerUnit, UUID> {
}
