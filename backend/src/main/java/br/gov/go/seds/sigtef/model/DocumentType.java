package br.gov.go.seds.sigtef.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "document_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
public class DocumentType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String context;

    @Column(name = "requires_expiration", nullable = false)
    @Builder.Default
    private Boolean requiresExpiration = false;

    @Column(name = "requires_sei", nullable = false)
    @Builder.Default
    private Boolean requiresSei = false;

    @Column(name = "requires_signature", nullable = false)
    @Builder.Default
    private Boolean requiresSignature = false;

    @Column(name = "categoria_documento", length = 80)
    private String categoriaDocumento;

    @Column(name = "exige_dados_nota_fiscal", nullable = false)
    @Builder.Default
    private Boolean exigeDadosNotaFiscal = false;

    @Column(name = "exige_chave_acesso_nfe", nullable = false)
    @Builder.Default
    private Boolean exigeChaveAcessoNfe = false;

    @Column(name = "eh_xml_fiscal", nullable = false)
    @Builder.Default
    private Boolean ehXmlFiscal = false;

    @Column(name = "eh_anexo_pesado", nullable = false)
    @Builder.Default
    private Boolean ehAnexoPesado = true;

    @Column(name = "expurgavel", nullable = false)
    @Builder.Default
    private Boolean expurgavel = true;

    @Column(name = "retencao_dias")
    private Integer retencaoDias;

    @Column(name = "compactar_apos_upload", nullable = false)
    @Builder.Default
    private Boolean compactarAposUpload = false;

    @Column(name = "permite_multiplos_anexos", nullable = false)
    @Builder.Default
    private Boolean permiteMultiplosAnexos = true;

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
