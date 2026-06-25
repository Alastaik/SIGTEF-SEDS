package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.agreement.SimulationResultDTO;
import br.gov.go.seds.sigtef.model.*;
import br.gov.go.seds.sigtef.repository.PartnershipAgreementProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CalculationSimulatorService {

    private final PartnershipAgreementProgramRepository agreementProgramRepository;
    private final ProgramService programService;

    /**
     * Simulates the expected value for a specific program in an agreement.
     * Based on the CalculationType of the Program.
     */
    public SimulationResultDTO simulateExpectedValue(UUID agreementId, UUID programId, int month, int year) {
        // 1. Encontrar o vínculo
        List<PartnershipAgreementProgram> programs = agreementProgramRepository.findByPartnershipAgreementId(agreementId);
        PartnershipAgreementProgram agreementProgram = programs.stream()
                .filter(p -> p.getProgram().getId().equals(programId) && p.getActive())
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Programa não está vinculado a este termo ou está inativo."));

        Program program = agreementProgram.getProgram();

        // 2. Determinar a data base (1º dia do mês)
        LocalDate baseDate = LocalDate.of(year, month, 1);

        // 3. Obter a tabela de valores vigente
        List<ProgramValueTable> valueTables = programService.findValuesByProgram(programId);
        Optional<ProgramValueTable> validTableOpt = valueTables.stream()
                .filter(vt -> !baseDate.isBefore(vt.getValidFrom()) && 
                             (vt.getValidTo() == null || !baseDate.isAfter(vt.getValidTo())))
                .findFirst();

        BigDecimal baseValue = validTableOpt.map(vt -> {
            if (program.getCalculationType() == CalculationType.POR_META) {
                return vt.getPerCapitaValue() != null ? vt.getPerCapitaValue() : BigDecimal.ZERO;
            } else {
                return vt.getStandardMonthlyValue() != null ? vt.getStandardMonthlyValue() : BigDecimal.ZERO;
            }
        }).orElse(BigDecimal.ZERO);

        // 4. Calcular baseado no Tipo de Cálculo
        CalculationType calcType = program.getCalculationType();
        if (calcType == null) {
            return SimulationResultDTO.builder()
                    .expectedMonthlyValue(BigDecimal.ZERO)
                    .expectedTotalValue(BigDecimal.ZERO)
                    .totalMonths(0)
                    .calculationType("Não Definido")
                    .build();
        }

        BigDecimal expectedMonthly = BigDecimal.ZERO;
        String calcTypeName = calcType.getDescription();

        switch (calcType) {
            case POR_META:
                // Fórmula: (Meta Pactuada) * (Dias de Atendimento) * (Valor Per Capita vigente)
                int goal = agreementProgram.getGoalQuantity() != null ? agreementProgram.getGoalQuantity() : 0;
                
                int days = 0;
                if (agreementProgram.getAttendanceFrequency() != null) {
                    switch (agreementProgram.getAttendanceFrequency()) {
                        case WEEKDAYS:
                            days = getBusinessDays(baseDate.getYear(), baseDate.getMonthValue());
                            break;
                        case EVERY_DAY:
                            days = baseDate.lengthOfMonth();
                            break;
                        case MANUAL:
                            days = agreementProgram.getAttendanceDays() != null ? agreementProgram.getAttendanceDays() : 0;
                            break;
                    }
                } else {
                    days = agreementProgram.getAttendanceDays() != null ? agreementProgram.getAttendanceDays() : 0;
                }

                BigDecimal perCapita = baseValue; 
                expectedMonthly = perCapita.multiply(BigDecimal.valueOf(goal)).multiply(BigDecimal.valueOf(days));
                break;
            case VALOR_FIXO:
            case REEMBOLSO:
            case LIMITE_MENSAL:
                expectedMonthly = agreementProgram.getExpectedMonthlyValue() != null ? 
                       agreementProgram.getExpectedMonthlyValue() : baseValue;
                break;
        }

        // Calculate Total Value based on Agreement Duration
        int totalMonths = 12; // Default if not possible to calculate
        PartnershipAgreement agreement = agreementProgram.getPartnershipAgreement();
        if (agreement.getStartDate() != null && agreement.getEndDate() != null) {
            long monthsBetween = java.time.temporal.ChronoUnit.MONTHS.between(
                java.time.YearMonth.from(agreement.getStartDate()), 
                java.time.YearMonth.from(agreement.getEndDate())
            );
            // Including the start and end month partially, so at least 1 month
            totalMonths = Math.max(1, (int) monthsBetween + 1);
        }

        BigDecimal expectedTotal = expectedMonthly.multiply(BigDecimal.valueOf(totalMonths));

        return SimulationResultDTO.builder()
                .expectedMonthlyValue(expectedMonthly)
                .expectedTotalValue(expectedTotal)
                .totalMonths(totalMonths)
                .calculationType(calcTypeName)
                .build();
    }

    private int getBusinessDays(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        int length = startDate.lengthOfMonth();
        int businessDays = 0;
        for (int i = 0; i < length; i++) {
            LocalDate date = startDate.plusDays(i);
            if (date.getDayOfWeek() != DayOfWeek.SATURDAY && date.getDayOfWeek() != DayOfWeek.SUNDAY) {
                businessDays++;
            }
        }
        return businessDays;
    }
}
