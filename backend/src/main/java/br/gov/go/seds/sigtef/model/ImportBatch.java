package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.ImportBatchStatus;
import br.gov.go.seds.sigtef.model.enums.ImportMode;
import br.gov.go.seds.sigtef.model.enums.ImportType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "import_batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "import_type", nullable = false)
    private ImportType importType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ImportMode mode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ImportBatchStatus status;

    @Column(name = "file_url")
    private String fileUrl;
    
    @Column(name = "original_file_name")
    private String originalFileName;

    @Column(name = "total_rows")
    private Integer totalRows = 0;

    @Column(name = "valid_rows")
    private Integer validRows = 0;

    @Column(name = "error_rows")
    private Integer errorRows = 0;

    @Column(name = "applied_rows")
    private Integer appliedRows = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Optional relation for bidirectional navigation if needed
    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ImportRow> rows = new ArrayList<>();
}
