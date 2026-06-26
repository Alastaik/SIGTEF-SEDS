package br.gov.go.seds.sigtef.dto;

import br.gov.go.seds.sigtef.model.enums.DocumentLinkRole;
import br.gov.go.seds.sigtef.model.enums.DocumentOwnerModule;
import br.gov.go.seds.sigtef.model.enums.RetentionPolicy;
import lombok.Data;

import java.util.UUID;

@Data
public class DocumentUploadRequest {
    private String title;
    private String description;
    private UUID documentTypeId;
    private DocumentOwnerModule ownerModule;
    private String linkedEntityType;
    private UUID linkedEntityId;
    private DocumentLinkRole role;
    private RetentionPolicy retentionPolicy;
}
