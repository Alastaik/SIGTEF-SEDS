package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.ImportRowStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "import_rows")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportRow {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private ImportBatch batch;

    @Column(name = "row_number", nullable = false)
    private Integer rowNumber;

    // We store the raw row data as JSON so we can map it to anything
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_data", columnDefinition = "jsonb")
    private String rawData;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ImportRowStatus status;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;
}
