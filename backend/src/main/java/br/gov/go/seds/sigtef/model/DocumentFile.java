package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.RetentionPolicy;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "document_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
public class DocumentFile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Document document;

    @Column(name = "stored_file_name", nullable = false, length = 255)
    private String storedFileName;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "sha256_hash", length = 64)
    private String sha256Hash;

    @Column(name = "version_number", nullable = false)
    @Builder.Default
    private Integer versionNumber = 1;

    @Column(name = "is_current_version", nullable = false)
    @Builder.Default
    private Boolean isCurrentVersion = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "retention_policy", nullable = false)
    @Builder.Default
    private RetentionPolicy retentionPolicy = RetentionPolicy.DO_NOT_EXPUNGE;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Column(name = "blocked_for_audit", nullable = false)
    @Builder.Default
    private Boolean blockedForAudit = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
