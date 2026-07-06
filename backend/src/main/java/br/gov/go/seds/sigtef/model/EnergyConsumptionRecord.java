package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.TariffFlag;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "energy_consumption_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
public class EnergyConsumptionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "legal_entity_id", nullable = false)
    private LegalEntity legalEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumer_unit_id")
    private LegalEntityConsumerUnit consumerUnit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competence_id", nullable = false)
    private Competence competence;

    @Column(name = "kwh_amount", nullable = false, precision = 12, scale = 3)
    private BigDecimal kwhAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "tariff_flag", nullable = false, length = 30)
    private TariffFlag tariffFlag;

    @Column(name = "total_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalValue;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 255, updatable = false)
    private String createdBy;

    @Column(name = "updated_by", length = 255)
    private String updatedBy;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
