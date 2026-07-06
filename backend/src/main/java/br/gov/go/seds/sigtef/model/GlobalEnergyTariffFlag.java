package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.TariffFlag;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "global_energy_tariff_flags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlobalEnergyTariffFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competence_id", nullable = false, unique = true)
    private Competence competence;

    @Enumerated(EnumType.STRING)
    @Column(name = "tariff_flag", nullable = false, length = 30)
    private TariffFlag tariffFlag;

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
