package br.gov.go.seds.sigtef.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "accountability_fiscal_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
public class FiscalDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private AccountabilitySubmission submission;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType; // NF-e, Recibo, Fatura, etc.

    @Column(name = "document_number", length = 100)
    private String documentNumber;

    @Column(name = "access_key", length = 100)
    private String accessKey; // Para NFe

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "issuer_cnpj", length = 14)
    private String issuerCnpj;

    @Column(name = "issuer_name", length = 200)
    private String issuerName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "fiscalDocument", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FiscalDocumentItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "fiscalDocument", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AccountabilityAttachment> attachments = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
