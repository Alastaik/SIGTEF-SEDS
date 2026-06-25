package br.gov.go.seds.sigtef.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "monthly_executions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"partnership_agreement_program_id", "competence"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
@EntityListeners(AuditingEntityListener.class)
public class MonthlyExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partnership_agreement_program_id", nullable = false)
    private PartnershipAgreementProgram partnershipAgreementProgram;

    @Column(nullable = false, length = 7)
    private String competence; // Format: YYYY-MM

    @Column(name = "expected_value", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal expectedValue = BigDecimal.ZERO;

    @Column(name = "transferred_value", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal transferredValue = BigDecimal.ZERO;

    @Column(name = "transfer_date")
    private java.time.LocalDate transferDate;

    @Column(name = "expected_goal")
    private Integer expectedGoal;

    @Column(name = "expected_service_days")
    private Integer expectedServiceDays;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumer_unit_id")
    private LegalEntityConsumerUnit consumerUnit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MonthlyExecutionStatus status = MonthlyExecutionStatus.WAITING_TRANSFER;

    @Column(nullable = false)
    @Builder.Default
    private Boolean blocked = false;

    @Column(name = "block_reason", columnDefinition = "TEXT")
    private String blockReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocked_by")
    private User blockedBy;

    @Column(name = "blocked_at")
    private LocalDateTime blockedAt;

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
