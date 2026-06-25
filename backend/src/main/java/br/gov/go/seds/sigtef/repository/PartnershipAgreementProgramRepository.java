package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.PartnershipAgreementProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PartnershipAgreementProgramRepository extends JpaRepository<PartnershipAgreementProgram, UUID> {
    List<PartnershipAgreementProgram> findByPartnershipAgreementId(UUID partnershipAgreementId);
    List<PartnershipAgreementProgram> findByPartnershipAgreementIdAndActiveTrue(UUID partnershipAgreementId);
}
