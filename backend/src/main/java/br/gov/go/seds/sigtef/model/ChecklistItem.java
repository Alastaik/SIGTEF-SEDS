package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.ConformityStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.Audited;
import java.util.UUID;

@Entity
@Table(name = "inspection_checklist_items")
@Getter
@Setter
@Audited
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    private Inspection inspection;

    @Column(nullable = false)
    private String category; // ex: "Infraestrutura", "Documentação", "Equipe"

    @Column(nullable = false, length = 500)
    private String question;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConformityStatus status;

    @Column(columnDefinition = "TEXT")
    private String observations;
}
