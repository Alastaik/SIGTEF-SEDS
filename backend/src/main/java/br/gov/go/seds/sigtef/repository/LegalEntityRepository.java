package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.LegalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LegalEntityRepository extends JpaRepository<LegalEntity, UUID> {
    Optional<LegalEntity> findByCnpj(String cnpj);
    boolean existsByCnpj(String cnpj);
}
