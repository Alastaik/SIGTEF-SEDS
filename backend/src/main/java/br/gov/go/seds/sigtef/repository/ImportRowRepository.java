package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.ImportRow;
import br.gov.go.seds.sigtef.model.enums.ImportRowStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ImportRowRepository extends JpaRepository<ImportRow, UUID> {
    Page<ImportRow> findByBatchId(UUID batchId, Pageable pageable);
    List<ImportRow> findByBatchIdAndStatus(UUID batchId, ImportRowStatus status);
}
