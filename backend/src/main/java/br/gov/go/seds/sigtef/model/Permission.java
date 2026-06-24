package br.gov.go.seds.sigtef.model;

import jakarta.persistence.*;
import lombok.*;

import org.hibernate.envers.Audited;

import java.util.UUID;

@Entity
@Table(name = "permissions")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 255)
    private String description;
}
