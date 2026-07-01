package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.admin.AgreementReportDTO;
import br.gov.go.seds.sigtef.dto.admin.AgreementReportFilterDTO;
import br.gov.go.seds.sigtef.dto.admin.EntityReportDTO;
import br.gov.go.seds.sigtef.dto.admin.ReportFilterDTO;
import br.gov.go.seds.sigtef.model.LegalEntity;
import br.gov.go.seds.sigtef.model.PartnershipAgreement;
import br.gov.go.seds.sigtef.model.enums.AgreementStatus;
import br.gov.go.seds.sigtef.repository.LegalEntityRepository;
import br.gov.go.seds.sigtef.repository.MonthlyExecutionRepository;
import br.gov.go.seds.sigtef.repository.PartnershipAgreementRepository;
import br.gov.go.seds.sigtef.repository.PartnershipAgreementProgramRepository;
import br.gov.go.seds.sigtef.repository.specs.LegalEntitySpecs;
import br.gov.go.seds.sigtef.repository.specs.PartnershipAgreementSpecs;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final LegalEntityRepository legalEntityRepository;
    private final PartnershipAgreementRepository agreementRepository;
    private final PartnershipAgreementProgramRepository programRepository;
    private final MonthlyExecutionRepository monthlyExecutionRepository;
    private final br.gov.go.seds.sigtef.repository.AccountabilityIssueRepository accountabilityIssueRepository;
    private final br.gov.go.seds.sigtef.repository.RelatorioEntidadeViewRepository viewRepository;
    private final br.gov.go.seds.sigtef.repository.PartnershipAgreementAddendumRepository addendumRepository;

    @Transactional(readOnly = true)
    public Page<EntityReportDTO> getEntityReport(ReportFilterDTO filter, Pageable pageable) {
        Page<br.gov.go.seds.sigtef.model.RelatorioEntidadeView> views = viewRepository.findAll(br.gov.go.seds.sigtef.repository.specs.RelatorioEntidadeViewSpecs.withFilters(filter), pageable);

        return views.map(v -> EntityReportDTO.builder()
                .id(v.getEntidadeId())
                .name(v.getRazaoSocial())
                .cnpj(v.getCnpj())
                .status(v.getStatusEntidade() != null ? v.getStatusEntidade().name() : "")
                .city(v.getMunicipioSede() != null ? v.getMunicipioSede() : "")
                .region(v.getRegiao() != null ? v.getRegiao() : "")
                .activePrograms(v.getProgramasAtivos() != null ? java.util.Arrays.asList(v.getProgramasAtivos().split(",\\s*")) : new ArrayList<>())
                .totalAgreements(0) // Obsoleted in complex reports, but could add to view if needed
                .activeAgreements(0) // Obsoleted in complex reports
                .totalTransferred(v.getTotalRecebidoGlobal())
                .build());
    }

    @Transactional(readOnly = true)
    public Page<AgreementReportDTO> getAgreementReport(AgreementReportFilterDTO filter, Pageable pageable) {
        Page<PartnershipAgreement> agreements = agreementRepository.findAll(
                PartnershipAgreementSpecs.withFilters(filter), pageable);

        return agreements.map(agreement -> {
            LegalEntity entity = agreement.getLegalEntity();

            // Programas vinculados a este termo
            List<String> programs = programRepository
                    .findByPartnershipAgreementId(agreement.getId())
                    .stream()
                    .map(pap -> pap.getProgram().getName())
                    .collect(Collectors.toList());

            // Valor total repassado (soma das parcelas no MonthlyExecution)
            BigDecimal transferred = monthlyExecutionRepository
                    .sumTransferredValueByAgreementId(agreement.getId());
            if (transferred == null) transferred = BigDecimal.ZERO;

            // Valor Global
            BigDecimal global = BigDecimal.ZERO;
            Boolean hasEndDate = agreement.getEndDate() != null;
            long totalMonths = 0;
            if (agreement.getStartDate() != null && hasEndDate) {
                totalMonths = ChronoUnit.MONTHS.between(agreement.getStartDate().withDayOfMonth(1), agreement.getEndDate().withDayOfMonth(1)) + 1;
            }
            List<br.gov.go.seds.sigtef.model.PartnershipAgreementProgram> agreementPrograms = programRepository.findByPartnershipAgreementId(agreement.getId());
            for (br.gov.go.seds.sigtef.model.PartnershipAgreementProgram p : agreementPrograms) {
                BigDecimal monthlyValue = BigDecimal.ZERO;
                if (p.getGoalQuantity() != null && p.getPerCapitaValue() != null && p.getAttendanceDays() != null) {
                    monthlyValue = p.getPerCapitaValue().multiply(new BigDecimal(p.getGoalQuantity())).multiply(new BigDecimal(p.getAttendanceDays()));
                } else {
                    br.gov.go.seds.sigtef.model.MonthlyExecution latestExec = monthlyExecutionRepository.findFirstByPartnershipAgreementProgramOrderByCompetenceDesc(p);
                    if (latestExec != null && latestExec.getExpectedValue() != null) {
                        monthlyValue = latestExec.getExpectedValue();
                    }
                }
                if (totalMonths > 0) {
                    global = global.add(monthlyValue.multiply(new BigDecimal(totalMonths)));
                }
            }
            List<br.gov.go.seds.sigtef.model.PartnershipAgreementAddendum> addendums = addendumRepository.findByPartnershipAgreementIdOrderByCreatedAtDesc(agreement.getId());
            for (br.gov.go.seds.sigtef.model.PartnershipAgreementAddendum ad : addendums) {
                if (ad.getValueAddition() != null && br.gov.go.seds.sigtef.model.enums.AddendumStatus.ACTIVE.equals(ad.getStatus())) {
                    global = global.add(ad.getValueAddition());
                }
            }

            // Percentual executado
            double percent = 0.0;
            if (global != null && global.compareTo(BigDecimal.ZERO) > 0) {
                percent = transferred
                        .multiply(BigDecimal.valueOf(100))
                        .divide(global, 2, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            // Dias restantes até o vencimento
            long daysRemaining = 0;
            if (agreement.getEndDate() != null) {
                daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), agreement.getEndDate());
            }

            return AgreementReportDTO.builder()
                    .id(agreement.getId())
                    .agreementNumber(agreement.getAgreementNumber())
                    .entityName(entity != null ? entity.getCorporateName() : "")
                    .entityCnpj(entity != null ? entity.getCnpj() : "")
                    .status(agreement.getStatus() != null ? agreement.getStatus().name() : "")
                    .programs(programs)
                    .startDate(agreement.getStartDate())
                    .endDate(agreement.getEndDate())
                    .daysRemaining(daysRemaining)
                    .globalValue(global != null ? global : BigDecimal.ZERO)
                    .transferredValue(transferred)
                    .percentExecuted(percent)
                    .city(entity != null && entity.getMainCity() != null ? entity.getMainCity().getName() : "")
                    .region(entity != null && entity.getMainCity() != null && entity.getMainCity().getRegion() != null
                            ? entity.getMainCity().getRegion().getName() : "")
                    .build();
        });
    }

    /**
     * Retorna a lista completa (sem paginação) para uso no ExportService.
     */
    @Transactional(readOnly = true)
    public List<EntityReportDTO> getAllEntitiesForExport(ReportFilterDTO filter) {
        List<br.gov.go.seds.sigtef.model.RelatorioEntidadeView> views = viewRepository.findAll(br.gov.go.seds.sigtef.repository.specs.RelatorioEntidadeViewSpecs.withFilters(filter));
        return views.stream().map(v -> EntityReportDTO.builder()
                .id(v.getEntidadeId())
                .name(v.getRazaoSocial())
                .cnpj(v.getCnpj())
                .status(v.getStatusEntidade() != null ? v.getStatusEntidade().name() : "")
                .city(v.getMunicipioSede() != null ? v.getMunicipioSede() : "")
                .region(v.getRegiao() != null ? v.getRegiao() : "")
                .activePrograms(v.getProgramasAtivos() != null ? java.util.Arrays.asList(v.getProgramasAtivos().split(",\\s*")) : new ArrayList<>())
                .totalAgreements(0) // Obsoleted in complex reports
                .activeAgreements(0) // Obsoleted in complex reports
                .totalTransferred(v.getTotalRecebidoGlobal())
                .build()).collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public Page<br.gov.go.seds.sigtef.dto.admin.ExecutionReportDTO> getExecutionReport(br.gov.go.seds.sigtef.dto.admin.ExecutionReportFilterDTO filter, Pageable pageable) {
        Page<br.gov.go.seds.sigtef.model.MonthlyExecution> executions = monthlyExecutionRepository.findAll(
                br.gov.go.seds.sigtef.repository.specs.MonthlyExecutionSpecs.withFilters(filter), pageable);

        return executions.map(this::mapToExecutionReportDTO);
    }

    @Transactional(readOnly = true)
    public List<br.gov.go.seds.sigtef.dto.admin.ExecutionReportDTO> getAllExecutionsForExport(br.gov.go.seds.sigtef.dto.admin.ExecutionReportFilterDTO filter) {
        List<br.gov.go.seds.sigtef.model.MonthlyExecution> executions = monthlyExecutionRepository.findAll(
                br.gov.go.seds.sigtef.repository.specs.MonthlyExecutionSpecs.withFilters(filter));

        return executions.stream().map(this::mapToExecutionReportDTO).collect(Collectors.toList());
    }

    private br.gov.go.seds.sigtef.dto.admin.ExecutionReportDTO mapToExecutionReportDTO(br.gov.go.seds.sigtef.model.MonthlyExecution execution) {
        PartnershipAgreement pa = execution.getPartnershipAgreementProgram().getPartnershipAgreement();
        return br.gov.go.seds.sigtef.dto.admin.ExecutionReportDTO.builder()
                .id(execution.getId())
                .competence(execution.getCompetence())
                .entityName(pa.getLegalEntity().getCorporateName())
                .agreementNumber(pa.getAgreementNumber())
                .programName(execution.getPartnershipAgreementProgram().getProgram().getName())
                .status(execution.getStatus().name())
                .expectedValue(execution.getExpectedValue())
                .transferredValue(execution.getTransferredValue())
                .transferDate(execution.getTransferDate() != null ? execution.getTransferDate().toString() : "")
                .build();
    }

    @Transactional(readOnly = true)
    public Page<br.gov.go.seds.sigtef.dto.admin.IssueReportDTO> getIssueReport(br.gov.go.seds.sigtef.dto.admin.IssueReportFilterDTO filter, Pageable pageable) {
        Page<br.gov.go.seds.sigtef.model.AccountabilityIssue> issues = accountabilityIssueRepository.findAll(
                br.gov.go.seds.sigtef.repository.specs.AccountabilityIssueSpecs.withFilters(filter), pageable);

        return issues.map(this::mapToIssueReportDTO);
    }

    @Transactional(readOnly = true)
    public List<br.gov.go.seds.sigtef.dto.admin.IssueReportDTO> getAllIssuesForExport(br.gov.go.seds.sigtef.dto.admin.IssueReportFilterDTO filter) {
        List<br.gov.go.seds.sigtef.model.AccountabilityIssue> issues = accountabilityIssueRepository.findAll(
                br.gov.go.seds.sigtef.repository.specs.AccountabilityIssueSpecs.withFilters(filter));

        return issues.stream().map(this::mapToIssueReportDTO).collect(Collectors.toList());
    }

    private br.gov.go.seds.sigtef.dto.admin.IssueReportDTO mapToIssueReportDTO(br.gov.go.seds.sigtef.model.AccountabilityIssue issue) {
        br.gov.go.seds.sigtef.model.MonthlyExecution me = issue.getAccountability().getMonthlyExecution();
        PartnershipAgreement pa = me.getPartnershipAgreementProgram().getPartnershipAgreement();
        return br.gov.go.seds.sigtef.dto.admin.IssueReportDTO.builder()
                .id(issue.getId())
                .entityName(pa.getLegalEntity().getCorporateName())
                .agreementNumber(pa.getAgreementNumber())
                .competence(me.getCompetence())
                .status(issue.getStatus().name())
                .priority(issue.getPriority().name())
                .issueType(issue.getIssueType().name())
                .deadline(issue.getDeadline() != null ? issue.getDeadline().toString() : "")
                .resolvedAt(issue.getResolvedAt() != null ? issue.getResolvedAt().toLocalDate().toString() : "")
                .overdue(issue.getDeadline() != null && issue.getDeadline().isBefore(LocalDate.now()) && issue.getStatus() != br.gov.go.seds.sigtef.model.IssueStatus.RESOLVED && issue.getStatus() != br.gov.go.seds.sigtef.model.IssueStatus.CANCELED)
                .description(issue.getDescription())
                .build();
    }
}

