package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.Accountability;
import br.gov.go.seds.sigtef.model.enums.AccountabilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

import java.util.List;

@Repository
public interface AccountabilityRepository extends JpaRepository<Accountability, UUID> {
    Optional<Accountability> findByMonthlyExecutionId(UUID monthlyExecutionId);
    
    List<Accountability> findByMonthlyExecutionPartnershipAgreementProgramId(UUID programId);

    @Query("SELECT COUNT(a) FROM Accountability a " +
           "WHERE a.monthlyExecution.partnershipAgreementProgram.partnershipAgreement.legalEntity.id = :legalEntityId " +
           "AND a.status IN :statuses")
    long countByLegalEntityIdAndStatusIn(@Param("legalEntityId") UUID legalEntityId, @Param("statuses") List<AccountabilityStatus> statuses);

    @Query("SELECT a.monthlyExecution.partnershipAgreementProgram.partnershipAgreement.legalEntity.id " +
           "FROM Accountability a " +
           "WHERE a.status = 'CLOSED_UNREALIZED' " +
           "GROUP BY a.monthlyExecution.partnershipAgreementProgram.partnershipAgreement.legalEntity.id " +
           "HAVING COUNT(a.id) = :overdueCount")
    List<UUID> findEntitiesWithOverdueCount(@Param("overdueCount") long overdueCount);
}
