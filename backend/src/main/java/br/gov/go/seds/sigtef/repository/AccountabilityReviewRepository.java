package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.AccountabilityReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountabilityReviewRepository extends JpaRepository<AccountabilityReview, UUID> {
    List<AccountabilityReview> findBySubmissionIdOrderByReviewedAtDesc(UUID submissionId);
}
