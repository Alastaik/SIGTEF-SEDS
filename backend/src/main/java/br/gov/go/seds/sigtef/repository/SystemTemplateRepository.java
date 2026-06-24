package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.SystemTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemTemplateRepository extends JpaRepository<SystemTemplate, String> {
}
