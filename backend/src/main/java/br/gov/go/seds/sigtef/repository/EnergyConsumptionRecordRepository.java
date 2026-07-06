package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.EnergyConsumptionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnergyConsumptionRecordRepository extends JpaRepository<EnergyConsumptionRecord, UUID> {
    
    @Query("SELECT e FROM EnergyConsumptionRecord e WHERE e.legalEntity.id = :legalEntityId ORDER BY e.competence.year DESC, e.competence.month DESC")
    List<EnergyConsumptionRecord> findByLegalEntityIdOrderByCompetenceDesc(@Param("legalEntityId") UUID legalEntityId);

    @Query("SELECT e FROM EnergyConsumptionRecord e WHERE e.legalEntity.id = :legalEntityId AND e.competence.year BETWEEN :yearStart AND :yearEnd ORDER BY e.competence.year ASC, e.competence.month ASC")
    List<EnergyConsumptionRecord> findByLegalEntityIdAndCompetenceYearBetweenOrderByCompetenceAsc(
            @Param("legalEntityId") UUID legalEntityId, 
            @Param("yearStart") int yearStart, 
            @Param("yearEnd") int yearEnd);

    @Query("SELECT e FROM EnergyConsumptionRecord e WHERE e.competence.year = :year ORDER BY e.competence.month ASC")
    List<EnergyConsumptionRecord> findByCompetenceYear(@Param("year") int year);

    boolean existsByLegalEntityIdAndCompetenceIdAndConsumerUnitId(UUID legalEntityId, UUID competenceId, UUID consumerUnitId);
    
    boolean existsByLegalEntityIdAndCompetenceIdAndConsumerUnitIdIsNull(UUID legalEntityId, UUID competenceId);
}
