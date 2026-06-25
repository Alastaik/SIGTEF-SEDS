package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.ProgramDocumentRequirement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProgramDocumentRequirementRepository extends JpaRepository<ProgramDocumentRequirement, UUID> {
    List<ProgramDocumentRequirement> findByProgramId(UUID programId);
    void deleteByProgramId(UUID programId);
}
