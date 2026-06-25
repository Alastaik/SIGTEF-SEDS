package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.AddressType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.envers.Audited;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "legal_entity_addresses")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LegalEntityAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "legal_entity_id", nullable = false)
    private LegalEntity legalEntity;

    @Enumerated(EnumType.STRING)
    @Column(name = "address_type", nullable = false, length = 50)
    private AddressType addressType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    private City city;

    @Column(nullable = false, length = 255)
    private String street;

    @Column(length = 50)
    private String number;

    @Column(length = 255)
    private String complement;

    @Column(length = 255)
    private String neighborhood;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

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
