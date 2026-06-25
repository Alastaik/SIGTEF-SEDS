package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.LegalEntityRepresentative;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LegalEntityRepresentativeRepository extends JpaRepository<LegalEntityRepresentative, UUID> {
    List<LegalEntityRepresentative> findByLegalEntityId(UUID legalEntityId);
    List<LegalEntityRepresentative> findByUserId(UUID userId);
    Optional<LegalEntityRepresentative> findByLegalEntityIdAndUserId(UUID legalEntityId, UUID userId);
}
