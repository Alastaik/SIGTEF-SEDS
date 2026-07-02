package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import br.gov.go.seds.sigtef.security.UserDetailsImpl;
import br.gov.go.seds.sigtef.repository.DocumentFileRepository;
import br.gov.go.seds.sigtef.model.DocumentFile;
import br.gov.go.seds.sigtef.model.DocumentLink;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;
    private final DocumentFileRepository documentFileRepository;

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String fileName, 
            HttpServletRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
            
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        java.util.Optional<DocumentFile> docFileOpt = documentFileRepository.findByStoredFileName(fileName);
        if (docFileOpt.isPresent()) {
            DocumentFile docFile = docFileOpt.get();
            if ("EXTERNO".equals(userDetails.getUserType())) {
                boolean hasAccess = false;
                if (docFile.getUploadedBy().getId().equals(userDetails.getId())) {
                    hasAccess = true;
                } else {
                    for (DocumentLink link : docFile.getDocument().getLinks()) {
                        if ("LEGAL_ENTITY".equals(link.getLinkedEntityType()) && 
                            userDetails.getAllowedEntities().contains(link.getLinkedEntityId().toString())) {
                            hasAccess = true;
                            break;
                        }
                    }
                }
                if (!hasAccess) {
                    return ResponseEntity.status(403).build();
                }
            }
        }

        Resource resource = fileStorageService.loadFileAsResource(fileName);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Ignorado, usaremos fallback
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
