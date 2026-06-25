package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.LegalEntityContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface LegalEntityContactRepository extends JpaRepository<LegalEntityContact, UUID> {
    List<LegalEntityContact> findByLegalEntityId(UUID legalEntityId);
}
