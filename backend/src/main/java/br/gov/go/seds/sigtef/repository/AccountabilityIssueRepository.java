package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.AccountabilityIssue;
import br.gov.go.seds.sigtef.model.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountabilityIssueRepository extends JpaRepository<AccountabilityIssue, UUID> {
    List<AccountabilityIssue> findByAccountabilityId(UUID accountabilityId);
    List<AccountabilityIssue> findByAccountabilityIdAndStatus(UUID accountabilityId, IssueStatus status);
    List<AccountabilityIssue> findByAccountabilityIdAndStatusNot(UUID accountabilityId, IssueStatus status);
    List<AccountabilityIssue> findByAccountabilityIdAndStatusNotIn(UUID accountabilityId, List<IssueStatus> statuses);

    @org.springframework.data.jpa.repository.Query("SELECT i FROM AccountabilityIssue i " +
            "JOIN i.accountability a " +
            "JOIN a.monthlyExecution me " +
            "JOIN me.partnershipAgreementProgram pap " +
            "JOIN pap.partnershipAgreement pa " +
            "WHERE pa.legalEntity.id = :entityId " +
            "ORDER BY i.createdAt DESC")
    List<AccountabilityIssue> findByEntityId(@org.springframework.data.repository.query.Param("entityId") UUID entityId);
}
