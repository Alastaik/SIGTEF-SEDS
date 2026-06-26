package br.gov.go.seds.sigtef.dto;

import br.gov.go.seds.sigtef.model.enums.DocumentLinkRole;
import br.gov.go.seds.sigtef.model.enums.DocumentOwnerModule;
import br.gov.go.seds.sigtef.model.enums.RetentionPolicy;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class DocumentResponse {
    private UUID id;
    private String title;
    private String description;
    private UUID documentTypeId;
    private String documentTypeName;
    private DocumentOwnerModule ownerModule;
    private LocalDateTime createdAt;
    private UUID createdById;
    
    // File info
    private UUID fileId;
    private String originalFileName;
    private String mimeType;
    private Long fileSize;
    private String sha256Hash;
    private Integer versionNumber;
    private RetentionPolicy retentionPolicy;
    private LocalDateTime uploadedAt;
    
    // Link info (if retrieved via link)
    private UUID linkId;
    private String linkedEntityType;
    private UUID linkedEntityId;
    private DocumentLinkRole role;
}
