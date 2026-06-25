package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.AddendumStatus;
import br.gov.go.seds.sigtef.model.enums.AddendumType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "partnership_agreement_addendums")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
@EntityListeners(AuditingEntityListener.class)
public class PartnershipAgreementAddendum {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partnership_agreement_id", nullable = false)
    private PartnershipAgreement partnershipAgreement;

    @Column(name = "addendum_number", length = 100)
    private String addendumNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "addendum_type", nullable = false, length = 50)
    private AddendumType addendumType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AddendumStatus status;

    @Column(name = "signature_date")
    private LocalDate signatureDate;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "new_end_date")
    private LocalDate newEndDate;

    @Column(name = "value_addition", precision = 15, scale = 2)
    private BigDecimal valueAddition;

    @Column(name = "justification", columnDefinition = "TEXT")
    private String justification;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreatedBy
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", updatable = false)
    private User createdBy;

    @LastModifiedBy
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
