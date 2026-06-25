package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.PartnershipAgreement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PartnershipAgreementRepository extends JpaRepository<PartnershipAgreement, UUID> {
    List<PartnershipAgreement> findByLegalEntityId(UUID legalEntityId);
}
