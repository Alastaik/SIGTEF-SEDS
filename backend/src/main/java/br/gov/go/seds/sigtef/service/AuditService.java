package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.AuditLogDTO;
import br.gov.go.seds.sigtef.model.CustomRevisionEntity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.CrossTypeRevisionChangesReader;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;
import org.hibernate.envers.query.AuditQuery;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Retorna as últimas N revisões globais do sistema.
     * Este é um método simplificado. O ideal para grandes volumes é paginar
     * direto via JPQL na tabela revinfo e depois buscar os detalhes.
     */
    public List<AuditLogDTO> getRecentRevisions(int limit) {
        AuditReader auditReader = AuditReaderFactory.get(entityManager);
        CrossTypeRevisionChangesReader changesReader = auditReader.getCrossTypeRevisionChangesReader();
        
        // Vamos buscar os IDs das últimas revisões na tabela de revinfo
        List<CustomRevisionEntity> revisions = entityManager
                .createQuery("SELECT r FROM CustomRevisionEntity r ORDER BY r.timestamp DESC", CustomRevisionEntity.class)
                .setMaxResults(limit)
                .getResultList();

        List<AuditLogDTO> result = new ArrayList<>();

        for (CustomRevisionEntity rev : revisions) {
            LocalDateTime dateTime = LocalDateTime.ofInstant(Instant.ofEpochMilli(rev.getTimestamp()), ZoneId.systemDefault());
            
            // Tenta descobrir quais classes foram modificadas nesta revisão (Se ativado no Hibernate Envers)
            // Se track-entities-changed-in-revision não estiver ativo, isso pode retornar vazio.
            try {
                List<Object> entities = changesReader.findEntities(rev.getId());
                if(entities != null && !entities.isEmpty()) {
                    for (Object entity : entities) {
                        result.add(AuditLogDTO.builder()
                                .revisionId(rev.getId())
                                .timestamp(dateTime)
                                .username(rev.getUsername())
                                .entityName(entity.getClass().getSimpleName())
                                .build());
                    }
                } else {
                     result.add(AuditLogDTO.builder()
                            .revisionId(rev.getId())
                            .timestamp(dateTime)
                            .username(rev.getUsername())
                            .entityName("Desconhecida (Ative org.hibernate.envers.track_entities_changed_in_revision)")
                            .build());
                }
            } catch(Exception e) {
                 result.add(AuditLogDTO.builder()
                        .revisionId(rev.getId())
                        .timestamp(dateTime)
                        .username(rev.getUsername())
                        .entityName("Múltiplas/Desconhecidas")
                        .build());
            }
        }

        return result;
    }
}
