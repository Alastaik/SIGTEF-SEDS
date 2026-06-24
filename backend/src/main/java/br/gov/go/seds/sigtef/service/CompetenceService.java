package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.model.Competence;
import br.gov.go.seds.sigtef.model.CompetenceReopening;
import br.gov.go.seds.sigtef.model.User;
import br.gov.go.seds.sigtef.model.enums.CompetenceStatus;
import br.gov.go.seds.sigtef.repository.CompetenceReopeningRepository;
import br.gov.go.seds.sigtef.repository.CompetenceRepository;
import br.gov.go.seds.sigtef.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompetenceService {

    private final CompetenceRepository competenceRepository;
    private final CompetenceReopeningRepository reopeningRepository;
    private final UserRepository userRepository;

    public List<Competence> findAll() {
        return competenceRepository.findAll(Sort.by(Sort.Direction.DESC, "year", "month"));
    }

    @Transactional
    public Competence create(Integer month, Integer year) {
        if (competenceRepository.findByMonthAndYear(month, year).isPresent()) {
            throw new RuntimeException("Competência já existe para este mês e ano.");
        }
        Competence c = Competence.builder()
                .month(month)
                .year(year)
                .status(CompetenceStatus.FUTURA)
                .build();
        return competenceRepository.save(c);
    }

    @Transactional
    public Competence changeStatus(UUID id, CompetenceStatus newStatus) {
        Competence competence = competenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Competência não encontrada."));
        competence.setStatus(newStatus);
        return competenceRepository.save(competence);
    }

    @Transactional
    public CompetenceReopening reopen(UUID id, UUID userId, String reason) {
        Competence competence = competenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Competência não encontrada."));
        
        if (competence.getStatus() != CompetenceStatus.FECHADA) {
            throw new RuntimeException("Apenas competências FECHADAS podem ser reabertas.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        competence.setStatus(CompetenceStatus.ABERTA_PRESTACAO);
        competenceRepository.save(competence);

        CompetenceReopening reopening = CompetenceReopening.builder()
                .competence(competence)
                .reopenedBy(user)
                .reason(reason)
                .build();
        return reopeningRepository.save(reopening);
    }
}
