package br.gov.go.seds.sigtef.dto;

import br.gov.go.seds.sigtef.model.enums.AccountabilityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountabilityReviewRequestDTO {
    private AccountabilityStatus status;
    private String comments;
}
