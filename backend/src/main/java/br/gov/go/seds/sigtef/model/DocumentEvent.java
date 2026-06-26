package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.DocumentEventType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "document_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
public class DocumentEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_file_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private DocumentFile documentFile;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private DocumentEventType eventType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by", nullable = false)
    private User performedBy;

    @Column(name = "performed_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime performedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String notes;
}
