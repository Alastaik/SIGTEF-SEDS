package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.model.MonthlyExecution;
import br.gov.go.seds.sigtef.model.MonthlyExecutionStatus;
import br.gov.go.seds.sigtef.model.PartnershipAgreementProgram;
import br.gov.go.seds.sigtef.repository.MonthlyExecutionRepository;
import br.gov.go.seds.sigtef.repository.PartnershipAgreementProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import br.gov.go.seds.sigtef.dto.agreement.SimulationResultDTO;

@Service
@RequiredArgsConstructor
public class MonthlyExecutionService {

    private final MonthlyExecutionRepository repository;
    private final PartnershipAgreementProgramRepository programRepository;
    private final CalculationSimulatorService calculationSimulatorService;

    public Page<MonthlyExecution> findByFilters(String competence, UUID legalEntityId, UUID programId, String status, Pageable pageable) {
        return repository.findByFilters(competence, legalEntityId, programId, status, pageable);
    }

    public Optional<MonthlyExecution> findById(UUID id) {
        return repository.findById(id);
    }

    @Transactional
    public MonthlyExecution save(MonthlyExecution execution) {
        return repository.save(execution);
    }

    @Transactional
    public void updateExecutionStatus(UUID id, MonthlyExecutionStatus status) {
        MonthlyExecution execution = repository.findById(id).orElseThrow();
        execution.setStatus(status);
        repository.save(execution);
    }

    public MonthlyExecution block(UUID id, String reason) {
        MonthlyExecution exec = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lançamento não encontrado"));
        exec.setBlocked(true);
        exec.setBlockReason(reason);
        exec.setStatus(MonthlyExecutionStatus.BLOCKED);
        // TODO: set blockedBy and blockedAt using security context
        return repository.save(exec);
    }

    @Transactional
    public MonthlyExecution unblock(UUID id) {
        MonthlyExecution exec = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lançamento não encontrado"));
        exec.setBlocked(false);
        exec.setBlockReason(null);
        exec.setBlockedBy(null);
        exec.setBlockedAt(null);
        exec.setStatus(MonthlyExecutionStatus.WAITING_TRANSFER); // volta para WAITING_TRANSFER, se for o caso
        return repository.save(exec);
    }

    @Transactional
    public MonthlyExecution registerTransfer(UUID id, java.math.BigDecimal value, LocalDate date) {
        MonthlyExecution exec = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lançamento não encontrado"));
        
        exec.setTransferredValue(value);
        exec.setTransferDate(date);
        
        if (value != null && value.compareTo(java.math.BigDecimal.ZERO) >= 0) {
            if (Boolean.TRUE.equals(exec.getPartnershipAgreementProgram().getProgram().getRequiresAccountability())) {
                exec.setStatus(MonthlyExecutionStatus.READY_FOR_ACCOUNTABILITY);
            } else {
                exec.setStatus(MonthlyExecutionStatus.CLOSED);
            }
        } else {
            exec.setStatus(MonthlyExecutionStatus.WAITING_TRANSFER);
        }
        
        return repository.save(exec);
    }

    @Transactional
    public int registerBatchTransfer(List<UUID> ids, LocalDate date) {
        int count = 0;
        List<MonthlyExecution> executions = repository.findAllById(ids);
        for (MonthlyExecution exec : executions) {
            if (exec.getStatus() == MonthlyExecutionStatus.WAITING_TRANSFER && Boolean.FALSE.equals(exec.getBlocked())) {
                exec.setTransferredValue(exec.getExpectedValue());
                exec.setTransferDate(date);
                if (Boolean.TRUE.equals(exec.getPartnershipAgreementProgram().getProgram().getRequiresAccountability())) {
                    exec.setStatus(MonthlyExecutionStatus.READY_FOR_ACCOUNTABILITY);
                } else {
                    exec.setStatus(MonthlyExecutionStatus.CLOSED);
                }
                repository.save(exec);
                count++;
            }
        }
        return count;
    }

    @Transactional
    public int generateForCompetence(String competence) {
        List<PartnershipAgreementProgram> activePrograms = programRepository.findActiveProgramsForExecutionGeneration();
        int count = 0;

        for (PartnershipAgreementProgram pap : activePrograms) {
            // Verifica se já existe para esta competência
            Optional<MonthlyExecution> existing = repository.findByPartnershipAgreementProgramIdAndCompetence(pap.getId(), competence);
            
            if (existing.isEmpty()) {
                java.math.BigDecimal expectedValue = pap.getExpectedMonthlyValue() != null ? pap.getExpectedMonthlyValue() : java.math.BigDecimal.ZERO;
                
                try {
                    String[] compParts = competence.split("/");
                    int month = Integer.parseInt(compParts[0]);
                    int year = Integer.parseInt(compParts[1]);
                    SimulationResultDTO sim = calculationSimulatorService.simulateExpectedValue(pap.getPartnershipAgreement().getId(), pap.getProgram().getId(), month, year);
                    expectedValue = sim.getExpectedMonthlyValue();
                } catch (Exception e) {
                    // Fallback to static expected value
                }

                MonthlyExecution exec = MonthlyExecution.builder()
                        .partnershipAgreementProgram(pap)
                        .competence(competence)
                        .expectedValue(expectedValue)
                        .expectedGoal(pap.getGoalQuantity())
                        .expectedServiceDays(pap.getAttendanceDays())
                        .consumerUnit(pap.getConsumerUnit())
                        .status(MonthlyExecutionStatus.WAITING_TRANSFER)
                        .build();
                repository.save(exec);
                count++;
            }
        }
        return count;
    }
}
