package br.gov.go.seds.sigtef.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DTO para endpoints de transferência de execuções mensais.
 */
@Data
public class MonthlyExecutionTransferDTO {
    private BigDecimal transferredValue;
    private LocalDate transferDate;
    private List<UUID> executionIds; // usado apenas no batch transfer
}
