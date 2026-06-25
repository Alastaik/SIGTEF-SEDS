package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.agreement.*;
import br.gov.go.seds.sigtef.model.*;
import br.gov.go.seds.sigtef.model.enums.AgreementStatus;
import br.gov.go.seds.sigtef.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartnershipAgreementService {

    private final PartnershipAgreementRepository agreementRepository;
    private final PartnershipAgreementProgramRepository programRepository;
    private final LegalEntityRepository legalEntityRepository;
    private final DomainDataRepository domainDataRepository;
    private final ProgramRepository programRefRepository;
    private final LegalEntityConsumerUnitRepository consumerUnitRepository;

    @Transactional
    public AgreementResponseDTO createAgreement(AgreementRequestDTO request) {
        LegalEntity legalEntity = legalEntityRepository.findById(request.getLegalEntityId())
                .orElseThrow(() -> new IllegalArgumentException("Legal Entity not found"));

        DomainData agreementType = null;
        if (request.getAgreementTypeId() != null) {
            agreementType = domainDataRepository.findById(request.getAgreementTypeId()).orElse(null);
        }

        DomainData processType = null;
        if (request.getProcessTypeId() != null) {
            processType = domainDataRepository.findById(request.getProcessTypeId()).orElse(null);
        }

        PartnershipAgreement agreement = PartnershipAgreement.builder()
                .legalEntity(legalEntity)
                .agreementNumber(request.getAgreementNumber())
                .year(request.getYear())
                .agreementType(agreementType)
                .seiProcessNumber(request.getSeiProcessNumber())
                .processType(processType)
                .objectDescription(request.getObjectDescription())
                .signatureDate(request.getSignatureDate())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .globalValue(request.getGlobalValue())
                .status(AgreementStatus.DRAFT) // Begins as DRAFT
                .notes(request.getNotes())
                .build();

        agreement = agreementRepository.save(agreement);
        return mapToResponseDTO(agreement);
    }

    @Transactional(readOnly = true)
    public List<AgreementResponseDTO> getAllAgreements() {
        return agreementRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AgreementResponseDTO> getAgreementsByEntity(UUID legalEntityId) {
        return agreementRepository.findByLegalEntityId(legalEntityId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AgreementResponseDTO getAgreementById(UUID id) {
        PartnershipAgreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agreement not found"));
        return mapToResponseDTO(agreement);
    }

    @Transactional
    public AgreementResponseDTO updateAgreement(UUID id, AgreementRequestDTO request) {
        PartnershipAgreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agreement not found"));

        if (request.getAgreementTypeId() != null) {
            agreement.setAgreementType(domainDataRepository.findById(request.getAgreementTypeId()).orElse(null));
        }
        if (request.getProcessTypeId() != null) {
            agreement.setProcessType(domainDataRepository.findById(request.getProcessTypeId()).orElse(null));
        }

        agreement.setAgreementNumber(request.getAgreementNumber());
        agreement.setYear(request.getYear());
        agreement.setSeiProcessNumber(request.getSeiProcessNumber());
        agreement.setObjectDescription(request.getObjectDescription());
        agreement.setSignatureDate(request.getSignatureDate());
        agreement.setStartDate(request.getStartDate());
        agreement.setEndDate(request.getEndDate());
        agreement.setGlobalValue(request.getGlobalValue());
        agreement.setNotes(request.getNotes());

        agreement = agreementRepository.save(agreement);
        return mapToResponseDTO(agreement);
    }

    @Transactional
    public void changeStatus(UUID id, AgreementStatus newStatus) {
        PartnershipAgreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agreement not found"));
        agreement.setStatus(newStatus);
        agreementRepository.save(agreement);
    }

    @Transactional
    public void deleteAgreement(UUID id) {
        PartnershipAgreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agreement not found"));
        
        // Excluir programas vinculados (PartnershipAgreementProgram) se houver
        List<PartnershipAgreementProgram> programs = programRepository.findByPartnershipAgreementId(id);
        if (!programs.isEmpty()) {
            programRepository.deleteAll(programs);
        }

        agreementRepository.delete(agreement);
    }

    // --- Programs Management ---

    @Transactional
    public AgreementProgramResponseDTO addProgram(UUID agreementId, AgreementProgramRequestDTO request) {
        PartnershipAgreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() -> new IllegalArgumentException("Agreement not found"));

        Program program = programRefRepository.findById(request.getProgramId())
                .orElseThrow(() -> new IllegalArgumentException("Program not found"));

        LegalEntityConsumerUnit consumerUnit = null;
        if (request.getConsumerUnitId() != null) {
            consumerUnit = consumerUnitRepository.findById(request.getConsumerUnitId()).orElse(null);
        }

        // Validações do Programa
        if (Boolean.TRUE.equals(program.getRequiresGoal()) && request.getGoalQuantity() == null) {
            throw new IllegalArgumentException("Este programa exige que uma Meta (quantidade) seja informada.");
        }
        if (Boolean.TRUE.equals(program.getRequiresServiceDays()) && request.getAttendanceDays() == null) {
            throw new IllegalArgumentException("Este programa exige que os Dias de Atendimento sejam informados.");
        }
        if (Boolean.TRUE.equals(program.getRequiresConsumerUnit()) && consumerUnit == null) {
            throw new IllegalArgumentException("Este programa exige que uma Unidade Consumidora seja informada.");
        }

        PartnershipAgreementProgram agreementProgram = PartnershipAgreementProgram.builder()
                .partnershipAgreement(agreement)
                .program(program)
                .expectedMonthlyValue(request.getExpectedMonthlyValue())
                .expectedTotalValue(request.getExpectedTotalValue())
                .goalQuantity(request.getGoalQuantity())
                .attendanceDays(request.getAttendanceDays())
                .perCapitaValue(request.getPerCapitaValue())
                .consumerUnit(consumerUnit)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        agreementProgram = programRepository.save(agreementProgram);
        return mapToProgramResponseDTO(agreementProgram);
    }

    @Transactional(readOnly = true)
    public List<AgreementProgramResponseDTO> getPrograms(UUID agreementId) {
        return programRepository.findByPartnershipAgreementId(agreementId).stream()
                .map(this::mapToProgramResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeProgram(UUID programId) {
        programRepository.deleteById(programId);
    }

    // --- Mappers ---

    private AgreementResponseDTO mapToResponseDTO(PartnershipAgreement agreement) {
        return AgreementResponseDTO.builder()
                .id(agreement.getId())
                .legalEntityId(agreement.getLegalEntity() != null ? agreement.getLegalEntity().getId() : null)
                .legalEntityName(agreement.getLegalEntity() != null ? agreement.getLegalEntity().getCorporateName() : null)
                .agreementNumber(agreement.getAgreementNumber())
                .year(agreement.getYear())
                .agreementTypeId(agreement.getAgreementType() != null ? agreement.getAgreementType().getId() : null)
                .agreementTypeName(agreement.getAgreementType() != null ? agreement.getAgreementType().getName() : null)
                .seiProcessNumber(agreement.getSeiProcessNumber())
                .processTypeId(agreement.getProcessType() != null ? agreement.getProcessType().getId() : null)
                .processTypeName(agreement.getProcessType() != null ? agreement.getProcessType().getName() : null)
                .objectDescription(agreement.getObjectDescription())
                .signatureDate(agreement.getSignatureDate())
                .startDate(agreement.getStartDate())
                .endDate(agreement.getEndDate())
                .globalValue(agreement.getGlobalValue())
                .status(agreement.getStatus())
                .notes(agreement.getNotes())
                .createdAt(agreement.getCreatedAt())
                .updatedAt(agreement.getUpdatedAt())
                .build();
    }

    private AgreementProgramResponseDTO mapToProgramResponseDTO(PartnershipAgreementProgram program) {
        return AgreementProgramResponseDTO.builder()
                .id(program.getId())
                .partnershipAgreementId(program.getPartnershipAgreement().getId())
                .programId(program.getProgram().getId())
                .programName(program.getProgram().getName())
                .expectedMonthlyValue(program.getExpectedMonthlyValue())
                .expectedTotalValue(program.getExpectedTotalValue())
                .goalQuantity(program.getGoalQuantity())
                .attendanceDays(program.getAttendanceDays())
                .perCapitaValue(program.getPerCapitaValue())
                .consumerUnitId(program.getConsumerUnit() != null ? program.getConsumerUnit().getId() : null)
                .consumerUnitName(program.getConsumerUnit() != null ? program.getConsumerUnit().getUnitNumber() : null)
                .active(program.getActive())
                .createdAt(program.getCreatedAt())
                .updatedAt(program.getUpdatedAt())
                .build();
    }
}
