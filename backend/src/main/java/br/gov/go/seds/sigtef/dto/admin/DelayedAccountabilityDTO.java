package br.gov.go.seds.sigtef.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import br.gov.go.seds.sigtef.model.enums.AccountabilityStatus;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DelayedAccountabilityDTO {
    private UUID accountabilityId;
    private int month;
    private int year;
    private String programName;
    private AccountabilityStatus status;
}
