package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.AccountabilityIssueResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountabilityIssueResponseRepository extends JpaRepository<AccountabilityIssueResponse, UUID> {
    List<AccountabilityIssueResponse> findByIssueIdOrderByVersionNumberDesc(UUID issueId);
}
