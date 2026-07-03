package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.MonthlyExecution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
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
    
    long countByPartnershipAgreementProgramId(UUID partnershipAgreementProgramId);
    
    long countByStatus(br.gov.go.seds.sigtef.model.MonthlyExecutionStatus status);
    
    long countByStatusIn(List<br.gov.go.seds.sigtef.model.MonthlyExecutionStatus> statuses);
    
    @Query("SELECT COUNT(me) FROM MonthlyExecution me " +
           "WHERE me.partnershipAgreementProgram.partnershipAgreement.legalEntity.id = :legalEntityId " +
           "AND me.status = :status")
    long countByLegalEntityIdAndStatus(@Param("legalEntityId") UUID legalEntityId, @Param("status") br.gov.go.seds.sigtef.model.MonthlyExecutionStatus status);

    // --- Resumo Financeiro por Entidade e Período ---

    /**
     * Soma total repassado para uma entidade em um intervalo de anos (competence YYYY-MM).
     * yearStart e yearEnd são opcionais: se nulos, não filtra por período.
     */
    @Query("SELECT COALESCE(SUM(me.transferredValue), 0) FROM MonthlyExecution me " +
           "JOIN me.partnershipAgreementProgram pap " +
           "JOIN pap.partnershipAgreement pa " +
           "WHERE pa.legalEntity.id = :entityId " +
           "AND (:yearStart IS NULL OR SUBSTRING(me.competence, 1, 4) >= :yearStart) " +
           "AND (:yearEnd IS NULL OR SUBSTRING(me.competence, 1, 4) <= :yearEnd)")
    BigDecimal sumTransferredByEntityAndPeriod(
            @Param("entityId") UUID entityId,
            @Param("yearStart") String yearStart,
            @Param("yearEnd") String yearEnd);

    /**
     * Totais por ano para uma entidade, retornando [year(String), total(BigDecimal)].
     */
    @Query("SELECT SUBSTRING(me.competence, 1, 4), COALESCE(SUM(me.transferredValue), 0) " +
           "FROM MonthlyExecution me " +
           "JOIN me.partnershipAgreementProgram pap " +
           "JOIN pap.partnershipAgreement pa " +
           "WHERE pa.legalEntity.id = :entityId " +
           "AND (:yearStart IS NULL OR SUBSTRING(me.competence, 1, 4) >= :yearStart) " +
           "AND (:yearEnd IS NULL OR SUBSTRING(me.competence, 1, 4) <= :yearEnd) " +
           "GROUP BY SUBSTRING(me.competence, 1, 4) " +
           "ORDER BY SUBSTRING(me.competence, 1, 4) ASC")
    List<Object[]> sumTransferredByEntityGroupedByYear(
            @Param("entityId") UUID entityId,
            @Param("yearStart") String yearStart,
            @Param("yearEnd") String yearEnd);

    /**
     * Totais por programa para uma entidade, retornando [programName(String), total(BigDecimal)].
     */
    @Query("SELECT pap.program.name, COALESCE(SUM(me.transferredValue), 0) " +
           "FROM MonthlyExecution me " +
           "JOIN me.partnershipAgreementProgram pap " +
           "JOIN pap.partnershipAgreement pa " +
           "WHERE pa.legalEntity.id = :entityId " +
           "AND (:yearStart IS NULL OR SUBSTRING(me.competence, 1, 4) >= :yearStart) " +
           "AND (:yearEnd IS NULL OR SUBSTRING(me.competence, 1, 4) <= :yearEnd) " +
           "GROUP BY pap.program.name " +
           "ORDER BY SUM(me.transferredValue) DESC")
    List<Object[]> sumTransferredByEntityGroupedByProgram(
            @Param("entityId") UUID entityId,
            @Param("yearStart") String yearStart,
            @Param("yearEnd") String yearEnd);
}
