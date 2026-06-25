package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.ContactType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.envers.Audited;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "legal_entity_contacts")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LegalEntityContact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "legal_entity_id", nullable = false)
    private LegalEntity legalEntity;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_type", nullable = false, length = 50)
    private ContactType contactType;

    @Column(nullable = false, length = 255)
    private String value;

    @Column(length = 255)
    private String description;

    @Column(name = "is_main")
    @Builder.Default
    private Boolean isMain = false;

    @Column(name = "active")
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
