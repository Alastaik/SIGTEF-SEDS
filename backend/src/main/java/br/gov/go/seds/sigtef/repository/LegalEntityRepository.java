package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.LegalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface LegalEntityRepository extends JpaRepository<LegalEntity, UUID>, JpaSpecificationExecutor<LegalEntity> {
    Optional<LegalEntity> findByCnpj(String cnpj);
    boolean existsByCnpj(String cnpj);
    
    long countByStatus(br.gov.go.seds.sigtef.model.enums.EntityStatus status);
}
