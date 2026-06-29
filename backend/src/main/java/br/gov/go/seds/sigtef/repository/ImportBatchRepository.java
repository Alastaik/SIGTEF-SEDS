package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.ImportBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ImportBatchRepository extends JpaRepository<ImportBatch, UUID> {
}
