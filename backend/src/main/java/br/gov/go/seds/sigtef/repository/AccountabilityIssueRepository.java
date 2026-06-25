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
}
