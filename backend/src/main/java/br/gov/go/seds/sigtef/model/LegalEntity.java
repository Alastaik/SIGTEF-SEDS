package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.EntityStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.envers.Audited;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "legal_entities")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LegalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 14)
    private String cnpj;

    @Column(name = "corporate_name", nullable = false, length = 255)
    private String corporateName;

    @Column(name = "trade_name", length = 255)
    private String tradeName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entity_type_id")
    private DomainData entityType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendance_nature_id")
    private DomainData attendanceNature;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_city_id")
    private City mainCity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private EntityStatus status = EntityStatus.PENDENTE_VALIDACAO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "legalEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LegalEntityAddress> addresses = new ArrayList<>();

    @OneToMany(mappedBy = "legalEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LegalEntityContact> contacts = new ArrayList<>();

    @OneToMany(mappedBy = "legalEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LegalEntityResponsible> responsibles = new ArrayList<>();

    @OneToMany(mappedBy = "legalEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LegalEntityConsumerUnit> consumerUnits = new ArrayList<>();
    
    @OneToMany(mappedBy = "legalEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LegalEntityNote> notes = new ArrayList<>();

}
