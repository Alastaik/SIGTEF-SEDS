package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.ImportBatchDTO;
import br.gov.go.seds.sigtef.model.ImportBatch;
import br.gov.go.seds.sigtef.model.enums.ImportBatchStatus;
import br.gov.go.seds.sigtef.model.enums.ImportMode;
import br.gov.go.seds.sigtef.model.enums.ImportType;
import br.gov.go.seds.sigtef.repository.ImportBatchRepository;
import br.gov.go.seds.sigtef.repository.ImportRowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImportService {

    private final ImportBatchRepository batchRepository;
    private final ImportRowRepository rowRepository;

    @Transactional
    public ImportBatchDTO uploadFileAndCreateBatch(ImportType type, ImportMode mode, MultipartFile file) {
        // TODO: Send file to Module 12 (Storage) and get URL. For now, mocking.
        String fakeUrl = "/storage/imports/" + file.getOriginalFilename();

        ImportBatch batch = ImportBatch.builder()
                .importType(type)
                .mode(mode)
                .status(ImportBatchStatus.UPLOADED)
                .originalFileName(file.getOriginalFilename())
                .fileUrl(fakeUrl)
                .totalRows(0)
                .validRows(0)
                .errorRows(0)
                .appliedRows(0)
                .build();

        batch = batchRepository.save(batch);
        
        // Em um fluxo real, chamaríamos o parser assíncrono aqui (ex: parseFileAsync(batch.getId()))
        log.info("Batch de importação criado: {}", batch.getId());
        
        return toDto(batch);
    }

    public List<ImportBatchDTO> findAllBatches() {
        return batchRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    public ImportBatchDTO findBatchById(UUID id) {
        return batchRepository.findById(id).map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Lote não encontrado"));
    }

    private ImportBatchDTO toDto(ImportBatch batch) {
        return ImportBatchDTO.builder()
                .id(batch.getId())
                .importType(batch.getImportType())
                .mode(batch.getMode())
                .status(batch.getStatus())
                .originalFileName(batch.getOriginalFileName())
                .totalRows(batch.getTotalRows())
                .validRows(batch.getValidRows())
                .errorRows(batch.getErrorRows())
                .appliedRows(batch.getAppliedRows())
                .createdAt(batch.getCreatedAt())
                .updatedAt(batch.getUpdatedAt())
                .build();
    }
}
