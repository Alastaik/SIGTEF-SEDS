package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.PartnershipAgreementAddendum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PartnershipAgreementAddendumRepository extends JpaRepository<PartnershipAgreementAddendum, UUID> {
    List<PartnershipAgreementAddendum> findByPartnershipAgreementIdOrderByCreatedAtDesc(UUID partnershipAgreementId);
}
