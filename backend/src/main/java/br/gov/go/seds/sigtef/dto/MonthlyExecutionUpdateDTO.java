package br.gov.go.seds.sigtef.dto;

import lombok.Data;
import java.util.UUID;

/**
 * DTO para atualizações seguras de MonthlyExecution via PUT.
 * Expõe apenas os campos que o usuário pode alterar manualmente,
 * impedindo mass assignment de campos sensíveis (status, transferredValue, etc.).
 */
@Data
public class MonthlyExecutionUpdateDTO {
    /** Identificador da unidade consumidora para substituição. */
    private UUID consumerUnitId;
}
