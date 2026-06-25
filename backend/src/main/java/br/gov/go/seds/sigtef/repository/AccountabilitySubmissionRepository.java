package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.AccountabilitySubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountabilitySubmissionRepository extends JpaRepository<AccountabilitySubmission, UUID> {
    List<AccountabilitySubmission> findByAccountabilityIdOrderByVersionNumberDesc(UUID accountabilityId);
}
