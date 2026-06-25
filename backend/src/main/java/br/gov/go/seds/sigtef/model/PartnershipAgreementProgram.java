package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.AttendanceFrequency;
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
@Table(name = "partnership_agreement_programs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
@EntityListeners(AuditingEntityListener.class)
public class PartnershipAgreementProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partnership_agreement_id", nullable = false)
    private PartnershipAgreement partnershipAgreement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @Column(name = "expected_monthly_value", precision = 15, scale = 2)
    private BigDecimal expectedMonthlyValue;

    @Column(name = "expected_total_value", precision = 15, scale = 2)
    private BigDecimal expectedTotalValue;

    @Column(name = "goal_quantity")
    private Integer goalQuantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "attendance_frequency")
    private AttendanceFrequency attendanceFrequency;

    @Column(name = "attendance_days")
    private Integer attendanceDays;

    @Column(name = "per_capita_value", precision = 10, scale = 2)
    private BigDecimal perCapitaValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumer_unit_id")
    private LegalEntityConsumerUnit consumerUnit;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

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
