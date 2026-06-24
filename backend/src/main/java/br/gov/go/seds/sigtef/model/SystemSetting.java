package br.gov.go.seds.sigtef.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.envers.Audited;

@Entity
@Table(name = "system_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
public class SystemSetting {

    @Id
    @Column(name = "setting_key", nullable = false, length = 100)
    private String key;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String value;

    @Column(name = "data_type", nullable = false, length = 20)
    private String dataType;

    @Column(columnDefinition = "TEXT")
    private String description;
}
