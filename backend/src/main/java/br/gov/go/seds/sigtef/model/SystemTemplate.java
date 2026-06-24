package br.gov.go.seds.sigtef.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.envers.Audited;

@Entity
@Table(name = "system_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Audited
public class SystemTemplate {

    @Id
    @Column(name = "template_key", nullable = false, length = 100)
    private String key;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "variables_description", columnDefinition = "TEXT")
    private String variablesDescription;
}
