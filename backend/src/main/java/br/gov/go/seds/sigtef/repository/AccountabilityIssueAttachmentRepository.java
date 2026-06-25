package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.AccountabilityIssueAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AccountabilityIssueAttachmentRepository extends JpaRepository<AccountabilityIssueAttachment, UUID> {
}
