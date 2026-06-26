package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
}
