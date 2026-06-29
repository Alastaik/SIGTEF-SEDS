package br.gov.go.seds.sigtef.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {
    private Integer revisionId;
    private LocalDateTime timestamp;
    private String username;
    private String entityName;
    private Long entityId;
    private String revisionType; // ADD, MOD, DEL
}
