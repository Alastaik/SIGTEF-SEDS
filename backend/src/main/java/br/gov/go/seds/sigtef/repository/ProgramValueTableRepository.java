package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.ProgramValueTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProgramValueTableRepository extends JpaRepository<ProgramValueTable, UUID> {
    List<ProgramValueTable> findByProgramId(UUID programId);
    
    @Query("SELECT p FROM ProgramValueTable p WHERE p.program.id = :programId AND " +
           "(p.validTo IS NULL OR p.validTo >= :startDate) AND " +
           "(:endDate IS NULL OR p.validFrom <= :endDate) AND " +
           "p.id <> :excludeId")
    List<ProgramValueTable> findOverlapping(UUID programId, LocalDate startDate, LocalDate endDate, UUID excludeId);
}
