package br.gov.go.seds.sigtef.dto.agreement;

import br.gov.go.seds.sigtef.model.enums.AttendanceFrequency;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;
import br.gov.go.seds.sigtef.model.enums.ProgramStatus;

@Data
public class AgreementProgramRequestDTO {
    private UUID programId;
    private BigDecimal expectedMonthlyValue;
    private BigDecimal expectedTotalValue;
    private Integer goalQuantity;
    private AttendanceFrequency attendanceFrequency;
    private Integer attendanceDays;
    private BigDecimal perCapitaValue;
    private UUID consumerUnitId;
    private ProgramStatus status;
}
