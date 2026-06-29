package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.PartnershipAgreement;
import br.gov.go.seds.sigtef.model.enums.AgreementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PartnershipAgreementRepository
        extends JpaRepository<PartnershipAgreement, UUID>,
                JpaSpecificationExecutor<PartnershipAgreement> {

    List<PartnershipAgreement> findByLegalEntityId(UUID legalEntityId);

    long countByStatus(AgreementStatus status);
    long countByStatusAndEndDateBefore(AgreementStatus status, java.time.LocalDate endDate);
}

