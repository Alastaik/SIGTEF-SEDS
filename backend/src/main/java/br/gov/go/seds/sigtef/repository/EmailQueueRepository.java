package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.EmailQueue;
import br.gov.go.seds.sigtef.model.enums.EmailStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmailQueueRepository extends JpaRepository<EmailQueue, UUID> {
    
    @Query("SELECT e FROM EmailQueue e WHERE e.status IN (:statuses) AND e.attemptCount < :maxAttempts ORDER BY e.createdAt ASC")
    List<EmailQueue> findEmailsToProcess(List<EmailStatus> statuses, int maxAttempts, Pageable pageable);
}
