package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.DocumentResponse;
import br.gov.go.seds.sigtef.dto.DocumentUploadRequest;
import br.gov.go.seds.sigtef.model.enums.DocumentLinkRole;
import br.gov.go.seds.sigtef.model.enums.DocumentOwnerModule;
import br.gov.go.seds.sigtef.model.enums.RetentionPolicy;
import br.gov.go.seds.sigtef.security.UserDetailsImpl;
import br.gov.go.seds.sigtef.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) UUID documentTypeId,
            @RequestParam(required = false, defaultValue = "GENERAL") DocumentOwnerModule ownerModule,
            @RequestParam(required = false) String linkedEntityType,
            @RequestParam(required = false) UUID linkedEntityId,
            @RequestParam(required = false, defaultValue = "ANEXO_GERAL") DocumentLinkRole role,
            @RequestParam(required = false, defaultValue = "DO_NOT_EXPUNGE") RetentionPolicy retentionPolicy,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        DocumentUploadRequest request = new DocumentUploadRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setDocumentTypeId(documentTypeId);
        request.setOwnerModule(ownerModule);
        request.setLinkedEntityType(linkedEntityType);
        request.setLinkedEntityId(linkedEntityId);
        request.setRole(role);
        request.setRetentionPolicy(retentionPolicy);

        return ResponseEntity.ok(documentService.uploadDocument(file, request, user.getId()));
    }

    @PostMapping("/{documentId}/replace")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DocumentResponse> replaceDocument(
            @PathVariable UUID documentId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        return ResponseEntity.ok(documentService.replaceDocument(documentId, file, user.getId()));
    }

    @GetMapping("/by-link")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByLink(
            @RequestParam String entityType,
            @RequestParam UUID entityId
    ) {
        return ResponseEntity.ok(documentService.getDocumentsByLink(entityType, entityId));
    }

    @GetMapping("/files/{fileId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable UUID fileId,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        Resource resource = documentService.downloadDocument(fileId, user.getId());

        String contentType = "application/octet-stream"; // fallback
        String headerValue = "attachment; filename=\"" + resource.getFilename() + "\"";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                .body(resource);
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable UUID documentId,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        documentService.deleteDocument(documentId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
