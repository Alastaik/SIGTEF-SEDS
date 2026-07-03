package br.gov.go.seds.sigtef.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class EntityFinancialSummaryDTO {

    private UUID entityId;
    private String entityName;
    private String cnpj;

    private Integer yearStart;
    private Integer yearEnd;

    /** Total repassado no período filtrado */
    private BigDecimal totalTransferred;

    /** Breakdown por ano */
    private List<YearSummary> byYear;

    /** Breakdown por programa */
    private List<ProgramSummary> byProgram;

    @Data
    @Builder
    public static class YearSummary {
        private Integer year;
        private BigDecimal total;
    }

    @Data
    @Builder
    public static class ProgramSummary {
        private String programName;
        private BigDecimal total;
    }
}
