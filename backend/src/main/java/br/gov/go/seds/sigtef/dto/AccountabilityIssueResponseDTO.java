package br.gov.go.seds.sigtef.dto;

import br.gov.go.seds.sigtef.model.IssueResponseStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class AccountabilityIssueResponseDTO {
    private UUID id;
    private UUID issueId;
    private Integer versionNumber;
    private UserDTO submittedBy;
    private LocalDateTime submittedAt;
    private String responseText;
    private IssueResponseStatus status;
    private UserDTO reviewedBy;
    private LocalDateTime reviewedAt;
    private String reviewNotes;
    private List<AccountabilityIssueAttachmentDTO> attachments;
}
