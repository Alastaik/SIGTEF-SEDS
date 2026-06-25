package br.gov.go.seds.sigtef.dto.representative;

import br.gov.go.seds.sigtef.model.enums.RepresentativeRole;
import br.gov.go.seds.sigtef.model.enums.RepresentativeStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class RepresentativeResponseDTO {
    private UUID id;
    private UUID userId;
    private String name;
    private String email;
    private RepresentativeRole role;
    private List<String> permissions;
    private RepresentativeStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
}
