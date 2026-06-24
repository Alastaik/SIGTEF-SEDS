package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.Competence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompetenceRepository extends JpaRepository<Competence, UUID> {
    Optional<Competence> findByMonthAndYear(Integer month, Integer year);
}
