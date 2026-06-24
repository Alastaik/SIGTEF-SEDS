package br.gov.go.seds.sigtef.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "programs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(length = 50, unique = true)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "requires_goal", nullable = false)
    @Builder.Default
    private Boolean requiresGoal = false;

    @Column(name = "requires_service_days", nullable = false)
    @Builder.Default
    private Boolean requiresServiceDays = false;

    @Column(name = "requires_consumer_unit", nullable = false)
    @Builder.Default
    private Boolean requiresConsumerUnit = false;

    @Column(name = "requires_invoice", nullable = false)
    @Builder.Default
    private Boolean requiresInvoice = false;

    @Column(name = "requires_receipt", nullable = false)
    @Builder.Default
    private Boolean requiresReceipt = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

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
