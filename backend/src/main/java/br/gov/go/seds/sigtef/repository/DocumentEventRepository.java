package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.DocumentEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DocumentEventRepository extends JpaRepository<DocumentEvent, UUID> {
}
