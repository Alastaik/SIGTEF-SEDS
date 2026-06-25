package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.CreateAddendumDTO;
import br.gov.go.seds.sigtef.dto.PartnershipAgreementAddendumDTO;
import br.gov.go.seds.sigtef.model.PartnershipAgreement;
import br.gov.go.seds.sigtef.model.PartnershipAgreementAddendum;
import br.gov.go.seds.sigtef.model.enums.AddendumStatus;
import br.gov.go.seds.sigtef.model.enums.AddendumType;
import br.gov.go.seds.sigtef.repository.PartnershipAgreementAddendumRepository;
import br.gov.go.seds.sigtef.repository.PartnershipAgreementRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartnershipAgreementAddendumService {

    private final PartnershipAgreementAddendumRepository addendumRepository;
    private final PartnershipAgreementRepository agreementRepository;

    @Transactional(readOnly = true)
    public List<PartnershipAgreementAddendumDTO> findByAgreementId(UUID agreementId) {
        return addendumRepository.findByPartnershipAgreementIdOrderByCreatedAtDesc(agreementId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PartnershipAgreementAddendumDTO create(CreateAddendumDTO dto) {
        PartnershipAgreement agreement = agreementRepository.findById(dto.getPartnershipAgreementId())
                .orElseThrow(() -> new EntityNotFoundException("Termo de Fomento não encontrado"));

        PartnershipAgreementAddendum addendum = new PartnershipAgreementAddendum();
        addendum.setPartnershipAgreement(agreement);
        addendum.setAddendumNumber(dto.getAddendumNumber());
        addendum.setAddendumType(dto.getAddendumType());
        addendum.setStatus(AddendumStatus.DRAFT);
        addendum.setSignatureDate(dto.getSignatureDate());
        addendum.setStartDate(dto.getStartDate());
        addendum.setNewEndDate(dto.getNewEndDate());
        addendum.setValueAddition(dto.getValueAddition());
        addendum.setJustification(dto.getJustification());
        addendum.setNotes(dto.getNotes());

        return toDTO(addendumRepository.save(addendum));
    }

    @Transactional
    public PartnershipAgreementAddendumDTO changeStatus(UUID id, AddendumStatus newStatus) {
        PartnershipAgreementAddendum addendum = addendumRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aditivo não encontrado"));

        if (addendum.getStatus() == AddendumStatus.APPLIED && newStatus != AddendumStatus.APPLIED) {
            throw new IllegalStateException("Não é possível reverter um aditivo que já foi aplicado. Crie um novo aditivo para correção.");
        }

        if (addendum.getStatus() != AddendumStatus.APPLIED && newStatus == AddendumStatus.APPLIED) {
            applyAddendumToAgreement(addendum);
        }

        addendum.setStatus(newStatus);
        return toDTO(addendumRepository.save(addendum));
    }

    @Transactional
    public void delete(UUID id) {
        PartnershipAgreementAddendum addendum = addendumRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aditivo não encontrado"));

        if (addendum.getStatus() == AddendumStatus.APPLIED) {
            throw new IllegalStateException("Não é possível excluir um aditivo que já foi aplicado.");
        }

        addendumRepository.delete(addendum);
    }

    private void applyAddendumToAgreement(PartnershipAgreementAddendum addendum) {
        PartnershipAgreement agreement = addendum.getPartnershipAgreement();

        boolean isPrazo = addendum.getAddendumType() == AddendumType.PRAZO || addendum.getAddendumType() == AddendumType.AMBOS;
        boolean isValor = addendum.getAddendumType() == AddendumType.VALOR || addendum.getAddendumType() == AddendumType.AMBOS;

        if (isPrazo && addendum.getNewEndDate() != null) {
            agreement.setEndDate(addendum.getNewEndDate());
        }

        if (isValor && addendum.getValueAddition() != null) {
            BigDecimal currentValue = agreement.getGlobalValue() != null ? agreement.getGlobalValue() : BigDecimal.ZERO;
            agreement.setGlobalValue(currentValue.add(addendum.getValueAddition()));
        }

        agreementRepository.save(agreement);
    }

    private PartnershipAgreementAddendumDTO toDTO(PartnershipAgreementAddendum entity) {
        PartnershipAgreementAddendumDTO dto = new PartnershipAgreementAddendumDTO();
        dto.setId(entity.getId());
        dto.setPartnershipAgreementId(entity.getPartnershipAgreement().getId());
        dto.setAddendumNumber(entity.getAddendumNumber());
        dto.setAddendumType(entity.getAddendumType());
        dto.setStatus(entity.getStatus());
        dto.setSignatureDate(entity.getSignatureDate());
        dto.setStartDate(entity.getStartDate());
        dto.setNewEndDate(entity.getNewEndDate());
        dto.setValueAddition(entity.getValueAddition());
        dto.setJustification(entity.getJustification());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
