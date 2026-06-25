package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.LegalEntityAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface LegalEntityAddressRepository extends JpaRepository<LegalEntityAddress, UUID> {
    List<LegalEntityAddress> findByLegalEntityId(UUID legalEntityId);
}
