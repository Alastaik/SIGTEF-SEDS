package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.DomainData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DomainDataRepository extends JpaRepository<DomainData, UUID> {
    List<DomainData> findByDomainType(String domainType);
}
