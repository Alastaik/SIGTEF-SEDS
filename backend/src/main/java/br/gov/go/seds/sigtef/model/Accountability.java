package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.AccountabilityStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "accountabilities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
public class Accountability {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "monthly_execution_id", nullable = false)
    private MonthlyExecution monthlyExecution;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AccountabilityStatus status;

    @Column(name = "proven_value", precision = 10, scale = 2)
    private BigDecimal provenValue;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
