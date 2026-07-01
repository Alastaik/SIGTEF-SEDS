package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.PartnershipAgreementProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PartnershipAgreementProgramRepository extends JpaRepository<PartnershipAgreementProgram, UUID> {
    List<PartnershipAgreementProgram> findByPartnershipAgreementId(UUID partnershipAgreementId);
    List<PartnershipAgreementProgram> findByPartnershipAgreementIdIn(List<UUID> partnershipAgreementIds);
    List<PartnershipAgreementProgram> findByPartnershipAgreementIdAndActiveTrue(UUID partnershipAgreementId);

    @org.springframework.data.jpa.repository.Query("SELECT pap FROM PartnershipAgreementProgram pap " +
            "JOIN FETCH pap.program " +
            "JOIN FETCH pap.partnershipAgreement pa " +
            "JOIN FETCH pa.legalEntity " +
            "LEFT JOIN FETCH pap.consumerUnit " +
            "WHERE pap.status = 'ACTIVE' " +
            "AND pa.status IN ('ACTIVE', 'SIGNED', 'IN_EXECUTION')")
    List<PartnershipAgreementProgram> findActiveProgramsForExecutionGeneration();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT pap.partnershipAgreement.legalEntity.id) FROM PartnershipAgreementProgram pap WHERE pap.status = 'SUSPENDED'")
    long countEntitiesWithSuspendedPrograms();
}
