package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.RepresentativeRole;
import br.gov.go.seds.sigtef.model.enums.RepresentativeStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.hibernate.envers.Audited;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "legal_entity_representatives")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
public class LegalEntityRepresentative {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "legal_entity_id", nullable = false)
    private LegalEntity legalEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RepresentativeRole role;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> permissions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RepresentativeStatus status;

    private LocalDate startDate;
    private LocalDate endDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
