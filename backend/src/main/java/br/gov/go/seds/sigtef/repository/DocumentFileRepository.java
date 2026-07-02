package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.DocumentFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface DocumentFileRepository extends JpaRepository<DocumentFile, UUID> {
    @Query("SELECT df FROM DocumentFile df WHERE df.expiredAt <= :now AND df.blockedForAudit = false")
    List<DocumentFile> findExpiredFiles(@Param("now") LocalDateTime now);
    
    java.util.Optional<DocumentFile> findByStoredFileName(String storedFileName);
}
