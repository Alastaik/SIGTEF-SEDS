package br.gov.go.seds.sigtef.dto.representative;

import lombok.Data;

@Data
public class AcceptInvitationRequestDTO {
    private String token;
    private String password;
    private Boolean acceptedTerms;
}
