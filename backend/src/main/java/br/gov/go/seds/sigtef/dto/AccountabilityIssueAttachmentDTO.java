package br.gov.go.seds.sigtef.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AccountabilityIssueAttachmentDTO {
    private UUID id;
    private String fileName;
    private String fileUrl;
    private String contentType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
}
