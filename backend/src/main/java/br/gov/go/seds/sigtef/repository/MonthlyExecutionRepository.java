package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.MonthlyExecution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MonthlyExecutionRepository extends JpaRepository<MonthlyExecution, UUID> {

    @Query("SELECT me FROM MonthlyExecution me " +
           "JOIN FETCH me.partnershipAgreementProgram pap " +
           "JOIN FETCH pap.program p " +
           "JOIN FETCH pap.partnershipAgreement pa " +
           "JOIN FETCH pa.legalEntity le " +
           "LEFT JOIN FETCH me.consumerUnit cu " +
           "WHERE (:competence IS NULL OR me.competence = :competence) " +
           "AND (:legalEntityId IS NULL OR le.id = :legalEntityId) " +
           "AND (:programId IS NULL OR p.id = :programId) " +
           "AND (:status IS NULL OR CAST(me.status AS string) = :status)")
    Page<MonthlyExecution> findByFilters(
            @Param("competence") String competence,
            @Param("legalEntityId") UUID legalEntityId,
            @Param("programId") UUID programId,
            @Param("status") String status,
            Pageable pageable
    );

    Optional<MonthlyExecution> findByPartnershipAgreementProgramIdAndCompetence(UUID partnershipAgreementProgramId, String competence);

    List<MonthlyExecution> findByPartnershipAgreementProgramId(UUID partnershipAgreementProgramId);
}
