package br.gov.go.seds.sigtef.dto.agreement;

import br.gov.go.seds.sigtef.model.enums.AttendanceFrequency;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import br.gov.go.seds.sigtef.model.enums.ProgramStatus;

@Data
@Builder
public class AgreementProgramResponseDTO {
    private UUID id;
    private UUID partnershipAgreementId;
    private UUID programId;
    private String programName;
    private BigDecimal expectedMonthlyValue;
    private BigDecimal expectedTotalValue;
    private Integer goalQuantity;
    private AttendanceFrequency attendanceFrequency;
    private Integer attendanceDays;
    private BigDecimal perCapitaValue;
    private UUID consumerUnitId;
    private String consumerUnitName;
    private ProgramStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
