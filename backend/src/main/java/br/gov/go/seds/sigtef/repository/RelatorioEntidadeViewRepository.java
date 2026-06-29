package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.RelatorioEntidadeView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RelatorioEntidadeViewRepository extends JpaRepository<RelatorioEntidadeView, UUID>, JpaSpecificationExecutor<RelatorioEntidadeView> {
}
