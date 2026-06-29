package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.config.CustomRevisionListener;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.RevisionEntity;
import org.hibernate.envers.RevisionNumber;
import org.hibernate.envers.RevisionTimestamp;
import org.hibernate.envers.ModifiedEntityNames;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "revinfo")
@RevisionEntity(CustomRevisionListener.class)
@Getter
@Setter
public class CustomRevisionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @RevisionNumber
    @Column(name = "rev")
    private int id;

    @RevisionTimestamp
    @Column(name = "revtstmp")
    private long timestamp;

    @Column(name = "username")
    private String username;

    @ElementCollection(fetch = FetchType.EAGER)
    @JoinTable(name = "revchanges", joinColumns = @JoinColumn(name = "rev"))
    @Column(name = "entityname")
    @ModifiedEntityNames
    private Set<String> modifiedEntityNames = new HashSet<>();
}
