package br.gov.go.seds.sigtef.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineEventDTO {
    private UUID id;
    private LocalDateTime date;
    private String title;
    private String description;
    private String type; // e.g. SUBMISSION, REVIEW, ISSUE_OPENED, ISSUE_RESPONDED, APPROVED
    private String actor; // e.g. "Entidade", "SEDS", "Sistema"
}
