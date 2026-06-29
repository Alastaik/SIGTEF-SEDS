package br.gov.go.seds.sigtef.dto.admin;

import br.gov.go.seds.sigtef.model.enums.EntityStatus;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class ReportFilterDTO {
    private String search;
    private EntityStatus entityStatus;
    private UUID cityId;
    private UUID regionId;
    private List<UUID> regioesIds;
    private List<UUID> programIds;
    private ProgramMatchMode programMatchMode = ProgramMatchMode.CONTAINS;
    private java.math.BigDecimal minMensal;
    private java.math.BigDecimal maxMensal;
    private java.math.BigDecimal minAnual;
    private java.math.BigDecimal maxAnual;
    private java.math.BigDecimal minGlobal;
    private java.math.BigDecimal maxGlobal;
    private java.time.LocalDate dataCadastroInicio;
    private java.time.LocalDate dataCadastroFim;

    public enum ProgramMatchMode {
        EXACT,
        CONTAINS
    }
}
