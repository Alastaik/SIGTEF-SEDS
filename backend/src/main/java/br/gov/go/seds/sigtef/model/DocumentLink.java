package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.DocumentLinkRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "document_links")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
public class DocumentLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Document document;

    @Column(name = "linked_entity_type", nullable = false, length = 100)
    private String linkedEntityType;

    @Column(name = "linked_entity_id", nullable = false)
    private UUID linkedEntityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private DocumentLinkRole role = DocumentLinkRole.ANEXO_GERAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
