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

public interface MonthlyExecutionRepository extends JpaRepository<MonthlyExecution, UUID>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<MonthlyExecution> {

    @org.springframework.data.jpa.repository.Query(
        "SELECT COALESCE(SUM(me.transferredValue), 0) FROM MonthlyExecution me " +
        "WHERE me.partnershipAgreementProgram.partnershipAgreement.id = :agreementId"
    )
    java.math.BigDecimal sumTransferredValueByAgreementId(@org.springframework.data.repository.query.Param("agreementId") UUID agreementId);

    MonthlyExecution findFirstByPartnershipAgreementProgramOrderByCompetenceDesc(br.gov.go.seds.sigtef.model.PartnershipAgreementProgram program);

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

    @Query("SELECT me FROM MonthlyExecution me " +
           "JOIN FETCH me.partnershipAgreementProgram pap " +
           "JOIN FETCH pap.program p " +
           "JOIN FETCH pap.partnershipAgreement pa " +
           "JOIN FETCH pa.legalEntity le " +
           "LEFT JOIN FETCH me.consumerUnit cu " +
           "WHERE me.id = :id AND le.id = :legalEntityId")
    Optional<MonthlyExecution> findByIdAndEntityId(@Param("id") UUID id, @Param("legalEntityId") UUID legalEntityId);

    List<MonthlyExecution> findByPartnershipAgreementProgramId(UUID partnershipAgreementProgramId);
    
    long countByStatus(br.gov.go.seds.sigtef.model.MonthlyExecutionStatus status);
    
    @Query("SELECT COUNT(me) FROM MonthlyExecution me " +
           "WHERE me.partnershipAgreementProgram.partnershipAgreement.legalEntity.id = :legalEntityId " +
           "AND me.status = :status")
    long countByLegalEntityIdAndStatus(@Param("legalEntityId") UUID legalEntityId, @Param("status") br.gov.go.seds.sigtef.model.MonthlyExecutionStatus status);
}
