package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.DocumentResponse;
import br.gov.go.seds.sigtef.dto.DocumentUploadRequest;
import br.gov.go.seds.sigtef.dto.FileStorageInfo;
import br.gov.go.seds.sigtef.model.*;
import br.gov.go.seds.sigtef.model.enums.DocumentEventType;
import br.gov.go.seds.sigtef.model.enums.RetentionPolicy;
import br.gov.go.seds.sigtef.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentFileRepository fileRepository;
    private final DocumentLinkRepository linkRepository;
    private final DocumentEventRepository eventRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public DocumentResponse uploadDocument(MultipartFile file, DocumentUploadRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        DocumentType docType = null;
        if (request.getDocumentTypeId() != null) {
            docType = documentTypeRepository.findById(request.getDocumentTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("DocumentType not found"));
        }

        // Store file physically
        FileStorageInfo fileInfo = fileStorageService.storeFileWithHash(file);

        // 1. Create Document
        Document document = Document.builder()
                .title(request.getTitle() != null ? request.getTitle() : fileInfo.getOriginalFileName())
                .description(request.getDescription())
                .documentType(docType)
                .ownerModule(request.getOwnerModule())
                .createdBy(user)
                .build();
        document = documentRepository.save(document);

        // Calculate expiration if applicable
        LocalDateTime expiredAt = calculateExpiration(request.getRetentionPolicy());

        // 2. Create DocumentFile (Version 1)
        DocumentFile docFile = DocumentFile.builder()
                .document(document)
                .storedFileName(fileInfo.getStoredFileName())
                .originalFileName(fileInfo.getOriginalFileName())
                .mimeType(fileInfo.getMimeType())
                .fileSize(fileInfo.getFileSize())
                .sha256Hash(fileInfo.getSha256Hash())
                .versionNumber(1)
                .isCurrentVersion(true)
                .retentionPolicy(request.getRetentionPolicy())
                .expiredAt(expiredAt)
                .blockedForAudit(false)
                .uploadedBy(user)
                .build();
        docFile = fileRepository.save(docFile);

        // 3. Create DocumentLink if provided
        DocumentLink link = null;
        if (request.getLinkedEntityType() != null && request.getLinkedEntityId() != null) {
            link = DocumentLink.builder()
                    .document(document)
                    .linkedEntityType(request.getLinkedEntityType())
                    .linkedEntityId(request.getLinkedEntityId())
                    .role(request.getRole())
                    .createdBy(user)
                    .build();
            link = linkRepository.save(link);
        }

        // 4. Create Event
        registerEvent(docFile, DocumentEventType.UPLOAD, user, "Initial upload");

        return mapToResponse(document, docFile, link);
    }

    @Transactional
    public DocumentResponse replaceDocument(UUID documentId, MultipartFile file, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        // Get current file
        DocumentFile currentFile = document.getFiles().stream()
                .filter(DocumentFile::getIsCurrentVersion)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No current version found for document"));

        // Mark old as not current
        currentFile.setIsCurrentVersion(false);
        fileRepository.save(currentFile);

        // Store new file physically
        FileStorageInfo fileInfo = fileStorageService.storeFileWithHash(file);

        // Create new DocumentFile
        DocumentFile newFile = DocumentFile.builder()
                .document(document)
                .storedFileName(fileInfo.getStoredFileName())
                .originalFileName(fileInfo.getOriginalFileName())
                .mimeType(fileInfo.getMimeType())
                .fileSize(fileInfo.getFileSize())
                .sha256Hash(fileInfo.getSha256Hash())
                .versionNumber(currentFile.getVersionNumber() + 1)
                .isCurrentVersion(true)
                .retentionPolicy(currentFile.getRetentionPolicy())
                .expiredAt(currentFile.getExpiredAt())
                .blockedForAudit(currentFile.getBlockedForAudit())
                .uploadedBy(user)
                .build();
        newFile = fileRepository.save(newFile);

        registerEvent(newFile, DocumentEventType.REPLACED, user, "Replaced version " + currentFile.getVersionNumber());

        DocumentLink firstLink = document.getLinks().isEmpty() ? null : document.getLinks().get(0);
        return mapToResponse(document, newFile, firstLink);
    }

    @Transactional
    public Resource downloadDocument(UUID fileId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        DocumentFile docFile = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));

        registerEvent(docFile, DocumentEventType.DOWNLOAD, user, null);

        return fileStorageService.loadFileAsResource(docFile.getStoredFileName());
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentsByLink(String entityType, UUID entityId) {
        List<DocumentLink> links = linkRepository.findByLinkedEntityTypeAndLinkedEntityId(entityType, entityId);
        
        return links.stream().map(link -> {
            Document doc = link.getDocument();
            DocumentFile currentFile = doc.getFiles().stream()
                    .filter(DocumentFile::getIsCurrentVersion)
                    .findFirst()
                    .orElse(doc.getFiles().get(doc.getFiles().size() - 1));
            return mapToResponse(doc, currentFile, link);
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteDocument(UUID documentId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        for (DocumentFile file : document.getFiles()) {
            if (!file.getBlockedForAudit()) {
                file.setExpiredAt(LocalDateTime.now()); // Expire immediately
                fileRepository.save(file);
                registerEvent(file, DocumentEventType.EXPUNGE_SCHEDULED, user, "Deleted by user");
            }
        }
    }

    @Scheduled(cron = "0 0 2 * * *") // Run at 2 AM every day
    @Transactional
    public void scheduleExpunge() {
        log.info("Starting scheduled expunge job...");
        List<DocumentFile> expiredFiles = fileRepository.findExpiredFiles(LocalDateTime.now());
        
        User systemUser = userRepository.findByEmail("admin@seds.go.gov.br").orElse(null); // Fallback for system jobs

        int count = 0;
        for (DocumentFile file : expiredFiles) {
            try {
                fileStorageService.deleteFile(file.getStoredFileName());
                file.setStoredFileName("EXPUNGED_" + file.getStoredFileName());
                fileRepository.save(file);
                
                if (systemUser != null) {
                    registerEvent(file, DocumentEventType.EXPUNGED, systemUser, "Auto expunged by retention policy");
                }
                count++;
            } catch (Exception e) {
                log.error("Failed to expunge file ID: {}", file.getId(), e);
            }
        }
        log.info("Expunge job finished. Expunged {} files.", count);
    }

    private void registerEvent(DocumentFile file, DocumentEventType type, User user, String notes) {
        DocumentEvent event = DocumentEvent.builder()
                .documentFile(file)
                .eventType(type)
                .performedBy(user)
                .notes(notes)
                .build();
        eventRepository.save(event);
    }

    private LocalDateTime calculateExpiration(RetentionPolicy policy) {
        if (policy == null) return null;
        switch (policy) {
            case EXPUNGE_AFTER_90_DAYS:
                return LocalDateTime.now().plusDays(90);
            case EXPUNGE_AFTER_5_YEARS:
                return LocalDateTime.now().plusYears(5);
            case FISCAL_XML_10_YEARS:
                return LocalDateTime.now().plusYears(10);
            case DO_NOT_EXPUNGE:
            default:
                return null;
        }
    }

    private DocumentResponse mapToResponse(Document document, DocumentFile file, DocumentLink link) {
        return DocumentResponse.builder()
                .id(document.getId())
                .title(document.getTitle())
                .description(document.getDescription())
                .documentTypeId(document.getDocumentType() != null ? document.getDocumentType().getId() : null)
                .documentTypeName(document.getDocumentType() != null ? document.getDocumentType().getName() : null)
                .ownerModule(document.getOwnerModule())
                .createdAt(document.getCreatedAt())
                .createdById(document.getCreatedBy() != null ? document.getCreatedBy().getId() : null)
                .fileId(file.getId())
                .originalFileName(file.getOriginalFileName())
                .mimeType(file.getMimeType())
                .fileSize(file.getFileSize())
                .sha256Hash(file.getSha256Hash())
                .versionNumber(file.getVersionNumber())
                .retentionPolicy(file.getRetentionPolicy())
                .uploadedAt(file.getUploadedAt())
                .linkId(link != null ? link.getId() : null)
                .linkedEntityType(link != null ? link.getLinkedEntityType() : null)
                .linkedEntityId(link != null ? link.getLinkedEntityId() : null)
                .role(link != null ? link.getRole() : null)
                .build();
    }
}
