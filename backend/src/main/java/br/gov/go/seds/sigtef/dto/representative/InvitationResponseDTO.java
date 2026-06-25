package br.gov.go.seds.sigtef.dto.representative;

import br.gov.go.seds.sigtef.model.enums.InvitationStatus;
import br.gov.go.seds.sigtef.model.enums.RepresentativeRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class InvitationResponseDTO {
    private UUID id;
    private String name;
    private String email;
    private InvitationStatus status;
    private RepresentativeRole role;
    private List<String> permissions;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
