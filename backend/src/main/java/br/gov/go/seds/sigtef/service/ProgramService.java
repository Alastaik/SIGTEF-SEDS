package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.model.Program;
import br.gov.go.seds.sigtef.model.ProgramValueTable;
import br.gov.go.seds.sigtef.repository.ProgramRepository;
import br.gov.go.seds.sigtef.repository.ProgramValueTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private final ProgramRepository programRepository;
    private final ProgramValueTableRepository valueTableRepository;

    public List<Program> findAll() {
        return programRepository.findAll();
    }

    public Program findById(UUID id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Programa não encontrado"));
    }

    @Transactional
    public Program save(Program program) {
        return programRepository.save(program);
    }

    @Transactional
    public void delete(UUID id) {
        programRepository.deleteById(id);
    }

    public List<ProgramValueTable> findValuesByProgram(UUID programId) {
        return valueTableRepository.findByProgramId(programId);
    }

    @Transactional
    public ProgramValueTable saveValueTable(UUID programId, ProgramValueTable valueTable) {
        Program program = findById(programId);
        
        // Regra: Não permitir vigência sobreposta
        LocalDate validTo = valueTable.getValidTo() != null ? valueTable.getValidTo() : LocalDate.of(2099, 12, 31);
        UUID excludeId = valueTable.getId() != null ? valueTable.getId() : UUID.randomUUID(); // Para novo registro, o id é null, usamos um random para não quebrar a query
        
        List<ProgramValueTable> overlapping = valueTableRepository.findOverlapping(
                programId, 
                valueTable.getValidFrom(), 
                valueTable.getValidTo() == null ? null : valueTable.getValidTo(),
                valueTable.getId() == null ? UUID.fromString("00000000-0000-0000-0000-000000000000") : valueTable.getId()
        );

        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Existe uma tabela de valores com vigência sobreposta para este período.");
        }

        valueTable.setProgram(program);
        return valueTableRepository.save(valueTable);
    }

    @Transactional
    public void deleteValueTable(UUID valueId) {
        valueTableRepository.deleteById(valueId);
    }
}
