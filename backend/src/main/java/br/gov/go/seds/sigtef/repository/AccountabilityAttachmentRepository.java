package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.AccountabilityAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountabilityAttachmentRepository extends JpaRepository<AccountabilityAttachment, UUID> {
    List<AccountabilityAttachment> findByFiscalDocumentId(UUID fiscalDocumentId);
    List<AccountabilityAttachment> findBySubmissionId(UUID submissionId);
}
