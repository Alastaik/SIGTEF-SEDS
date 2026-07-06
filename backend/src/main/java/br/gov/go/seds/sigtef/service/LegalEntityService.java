package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.model.LegalEntity;
import br.gov.go.seds.sigtef.model.LegalEntityHistory;
import br.gov.go.seds.sigtef.model.User;
import br.gov.go.seds.sigtef.model.enums.EntityStatus;
import br.gov.go.seds.sigtef.repository.*;
import br.gov.go.seds.sigtef.util.CnpjValidator;
import br.gov.go.seds.sigtef.util.CpfValidator;
import br.gov.go.seds.sigtef.dto.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LegalEntityService {

    private final LegalEntityRepository legalEntityRepository;
    private final LegalEntityHistoryRepository historyRepository;
    private final LegalEntityAddressRepository addressRepository;
    private final LegalEntityContactRepository contactRepository;
    private final LegalEntityResponsibleRepository responsibleRepository;
    private final LegalEntityConsumerUnitRepository consumerUnitRepository;
    private final LegalEntityNoteRepository noteRepository;
    private final CityRepository cityRepository;
    private final DomainDataRepository domainDataRepository;
    private final PartnershipAgreementRepository partnershipAgreementRepository;

    public List<LegalEntity> findAll() {
        return legalEntityRepository.findAll();
    }

    public Optional<LegalEntity> findById(UUID id) {
        return legalEntityRepository.findById(id);
    }

    @Transactional
    public LegalEntity create(LegalEntity entity, User creator) {
        if (!CnpjValidator.isValid(entity.getCnpj())) {
            throw new IllegalArgumentException("CNPJ inválido matematicamente.");
        }
        if (legalEntityRepository.existsByCnpj(entity.getCnpj())) {
            throw new IllegalArgumentException("Já existe uma entidade com este CNPJ.");
        }
        
        if (entity.getStatus() == null) {
            entity.setStatus(EntityStatus.PENDENTE_VALIDACAO);
        }

        // Guarantee one main address if any address is passed
        if (entity.getAddresses() != null && !entity.getAddresses().isEmpty()) {
            long mainCount = entity.getAddresses().stream().filter(a -> Boolean.TRUE.equals(a.getIsMain())).count();
            if (mainCount == 0) {
                entity.getAddresses().get(0).setIsMain(true);
            } else if (mainCount > 1) {
                throw new IllegalArgumentException("A entidade deve ter apenas um endereço principal.");
            }
        }

        if (entity.getMainCity() != null && entity.getMainCity().getId() != null) {
            entity.setMainCity(cityRepository.findById(entity.getMainCity().getId()).orElseThrow(() -> new IllegalArgumentException("Município não encontrado.")));
        }
        if (entity.getAttendanceNature() != null && entity.getAttendanceNature().getId() != null) {
            entity.setAttendanceNature(domainDataRepository.findById(entity.getAttendanceNature().getId()).orElseThrow(() -> new IllegalArgumentException("Natureza de Atendimento não encontrada.")));
        }

        LegalEntity saved = legalEntityRepository.save(entity);

        // Save history
        LegalEntityHistory history = LegalEntityHistory.builder()
                .legalEntity(saved)
                .action("ENTIDADE_CRIADA")
                .description("Entidade cadastrada com status: " + saved.getStatus())
                .createdBy(creator)
                .build();
        historyRepository.save(history);

        return saved;
    }

    @Transactional
    public LegalEntity changeStatus(UUID id, EntityStatus newStatus, User user, String reason) {
        LegalEntity entity = legalEntityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entidade não encontrada"));

        EntityStatus oldStatus = entity.getStatus();
        if (oldStatus == newStatus) {
            return entity;
        }

        entity.setStatus(newStatus);
        LegalEntity saved = legalEntityRepository.save(entity);

        LegalEntityHistory history = LegalEntityHistory.builder()
                .legalEntity(saved)
                .action("MUDANCA_STATUS")
                .description(String.format("Status alterado de %s para %s. Motivo: %s", oldStatus, newStatus, reason))
                .createdBy(user)
                .build();
        historyRepository.save(history);

        return saved;
    }

    @Transactional
    public void deleteEntity(UUID id) {
        LegalEntity entity = legalEntityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entidade não encontrada"));

        if (!partnershipAgreementRepository.findByLegalEntityId(id).isEmpty()) {
            throw new IllegalStateException("Não é possível excluir esta entidade pois existem Termos de Fomento vinculados a ela.");
        }

        legalEntityRepository.delete(entity);
    }

    // Additional methods for updating details, adding addresses, etc. will go here

    @Transactional
    public br.gov.go.seds.sigtef.model.LegalEntityAddress addAddress(UUID entityId, AddressRequestDTO dto, User user) {
        LegalEntity entity = legalEntityRepository.findById(entityId).orElseThrow(() -> new RuntimeException("Entity not found"));
        br.gov.go.seds.sigtef.model.City city = cityRepository.findById(dto.getCityId()).orElseThrow(() -> new RuntimeException("City not found"));

        if (Boolean.TRUE.equals(dto.getIsMain())) {
            // Unset current main address
            addressRepository.findByLegalEntityId(entityId).forEach(addr -> {
                if (Boolean.TRUE.equals(addr.getIsMain())) {
                    addr.setIsMain(false);
                    addressRepository.save(addr);
                }
            });
        } else {
            // If it's the first one, force main
            if (addressRepository.findByLegalEntityId(entityId).isEmpty()) {
                dto.setIsMain(true);
            }
        }

        var address = br.gov.go.seds.sigtef.model.LegalEntityAddress.builder()
                .legalEntity(entity)
                .addressType(dto.getAddressType())
                .city(city)
                .street(dto.getStreet())
                .number(dto.getNumber())
                .complement(dto.getComplement())
                .neighborhood(dto.getNeighborhood())
                .zipCode(dto.getZipCode())
                .isMain(Boolean.TRUE.equals(dto.getIsMain()))
                .build();
        return addressRepository.save(address);
    }

    @Transactional
    public br.gov.go.seds.sigtef.model.LegalEntityContact addContact(UUID entityId, ContactRequestDTO dto, User user) {
        LegalEntity entity = legalEntityRepository.findById(entityId).orElseThrow(() -> new RuntimeException("Entity not found"));

        if (Boolean.TRUE.equals(dto.getIsMain())) {
            contactRepository.findByLegalEntityId(entityId).forEach(c -> {
                if (Boolean.TRUE.equals(c.getIsMain())) {
                    c.setIsMain(false);
                    contactRepository.save(c);
                }
            });
        } else {
            if (contactRepository.findByLegalEntityId(entityId).isEmpty()) {
                dto.setIsMain(true);
            }
        }

        var contact = br.gov.go.seds.sigtef.model.LegalEntityContact.builder()
                .legalEntity(entity)
                .contactType(dto.getContactType())
                .value(dto.getValue())
                .description(dto.getDescription())
                .isMain(Boolean.TRUE.equals(dto.getIsMain()))
                .build();
        return contactRepository.save(contact);
    }

    @Transactional
    public br.gov.go.seds.sigtef.model.LegalEntityResponsible addResponsible(UUID entityId, ResponsibleRequestDTO dto, User user) {
        LegalEntity entity = legalEntityRepository.findById(entityId).orElseThrow(() -> new RuntimeException("Entity not found"));
        
        if (!CpfValidator.isValid(dto.getCpf())) {
            throw new IllegalArgumentException("CPF do responsável inválido matematicamente.");
        }

        var responsible = br.gov.go.seds.sigtef.model.LegalEntityResponsible.builder()
                .legalEntity(entity)
                .name(dto.getName())
                .cpf(dto.getCpf().replaceAll("\\D", ""))
                .role(dto.getRole())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .build();
        return responsibleRepository.save(responsible);
    }

    @Transactional
    public br.gov.go.seds.sigtef.model.LegalEntityConsumerUnit addConsumerUnit(UUID entityId, ConsumerUnitRequestDTO dto, User user) {
        LegalEntity entity = legalEntityRepository.findById(entityId).orElseThrow(() -> new RuntimeException("Entity not found"));
        br.gov.go.seds.sigtef.model.DomainData provider = null;
        if (dto.getProviderId() != null) {
            provider = domainDataRepository.findById(dto.getProviderId()).orElse(null);
        }
        
        var uc = br.gov.go.seds.sigtef.model.LegalEntityConsumerUnit.builder()
                .legalEntity(entity)
                .utilityType(dto.getUtilityType())
                .provider(provider)
                .unitNumber(dto.getUnitNumber())
                .build();
        return consumerUnitRepository.save(uc);
    }

    @Transactional
    public br.gov.go.seds.sigtef.model.LegalEntityConsumerUnit updateConsumerUnit(UUID entityId, UUID unitId, ConsumerUnitRequestDTO dto, User user) {
        var uc = consumerUnitRepository.findById(unitId)
                .orElseThrow(() -> new RuntimeException("Consumer unit not found"));
        
        if (!uc.getLegalEntity().getId().equals(entityId)) {
            throw new RuntimeException("Consumer unit does not belong to this entity");
        }

        br.gov.go.seds.sigtef.model.DomainData provider = null;
        if (dto.getProviderId() != null) {
            provider = domainDataRepository.findById(dto.getProviderId()).orElse(null);
        }

        uc.setUtilityType(dto.getUtilityType());
        uc.setProvider(provider);
        uc.setUnitNumber(dto.getUnitNumber());
        
        return consumerUnitRepository.save(uc);
    }

    @Transactional
    public void deleteConsumerUnit(UUID entityId, UUID unitId, User user) {
        var uc = consumerUnitRepository.findById(unitId)
                .orElseThrow(() -> new RuntimeException("Consumer unit not found"));
        
        if (!uc.getLegalEntity().getId().equals(entityId)) {
            throw new RuntimeException("Consumer unit does not belong to this entity");
        }

        consumerUnitRepository.delete(uc);
    }

    @Transactional
    public br.gov.go.seds.sigtef.model.LegalEntityNote addNote(UUID entityId, NoteRequestDTO dto, User user) {
        LegalEntity entity = legalEntityRepository.findById(entityId).orElseThrow(() -> new RuntimeException("Entity not found"));

        var note = br.gov.go.seds.sigtef.model.LegalEntityNote.builder()
                .legalEntity(entity)
                .note(dto.getNote())
                .createdBy(user)
                .build();
        return noteRepository.save(note);
    }
}
