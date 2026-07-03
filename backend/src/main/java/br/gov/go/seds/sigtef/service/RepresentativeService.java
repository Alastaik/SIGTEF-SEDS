package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.representative.*;
import br.gov.go.seds.sigtef.model.*;
import br.gov.go.seds.sigtef.model.enums.InvitationStatus;
import br.gov.go.seds.sigtef.model.enums.RepresentativeStatus;
import br.gov.go.seds.sigtef.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RepresentativeService {

    private final LegalEntityRepresentativeRepository representativeRepository;
    private final RepresentativeInvitationRepository invitationRepository;
    private final LegalEntityRepository legalEntityRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public void inviteRepresentative(UUID legalEntityId, InviteRequestDTO request) {
        LegalEntity legalEntity = legalEntityRepository.findById(legalEntityId)
                .orElseThrow(() -> new IllegalArgumentException("Entidade não encontrada"));

        // Se já existe convite pendente, podemos cancelar o antigo ou apenas criar um novo
        // Para simplificar, vamos criar o novo

        String token = UUID.randomUUID().toString();

        RepresentativeInvitation invitation = RepresentativeInvitation.builder()
                .legalEntity(legalEntity)
                .name(request.getName())
                .email(request.getEmail())
                .role(request.getRole())
                .permissions(request.getPermissions())
                .token(token)
                .status(InvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusDays(7)) // 7 dias de validade
                .build();

        invitationRepository.save(invitation);

        String inviteLink = frontendUrl + "/convite/" + token;
        emailService.sendRepresentativeInvitationEmail(request.getEmail(), request.getName(), legalEntity.getCorporateName(), inviteLink);
    }

    @Transactional(readOnly = true)
    public List<RepresentativeResponseDTO> getRepresentatives(UUID legalEntityId) {
        return representativeRepository.findByLegalEntityId(legalEntityId).stream()
                .map(this::mapToRepresentativeResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvitationResponseDTO> getPendingInvitations(UUID legalEntityId) {
        return invitationRepository.findByLegalEntityId(legalEntityId).stream()
                .filter(inv -> inv.getStatus() == InvitationStatus.PENDING)
                .map(this::mapToInvitationResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void acceptInvitation(AcceptInvitationRequestDTO request) {
        if (request.getAcceptedTerms() == null || !request.getAcceptedTerms()) {
            throw new IllegalArgumentException("Você deve aceitar os termos de responsabilidade.");
        }

        RepresentativeInvitation invitation = invitationRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Convite inválido ou não encontrado."));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalArgumentException("Este convite já foi processado ou expirou.");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new IllegalArgumentException("Convite expirado.");
        }

        // Criar ou atualizar usuário
        Optional<User> existingUser = userRepository.findByEmail(invitation.getEmail());
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            user = new User();
            user.setName(invitation.getName());
            user.setEmail(invitation.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setUserType("EXTERNO");
            user.setActive(true);
            
            // Atribuir role base "Representante da Entidade" se existir, ou apenas salvar
            Role extRole = roleRepository.findByName("Representante da Entidade").orElse(null);
            if (extRole != null) {
                user.getRoles().add(extRole);
            }
            
            user = userRepository.save(user);
        }

        // Criar vínculo
        LegalEntityRepresentative rep = LegalEntityRepresentative.builder()
                .legalEntity(invitation.getLegalEntity())
                .user(user)
                .role(invitation.getRole())
                .permissions(invitation.getPermissions())
                .status(RepresentativeStatus.ACTIVE)
                .startDate(LocalDate.now())
                .build();

        representativeRepository.save(rep);

        // Atualizar convite
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation);
    }

    @Transactional
    public void cancelInvitation(UUID invitationId) {
        RepresentativeInvitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Convite não encontrado"));
        inv.setStatus(InvitationStatus.CANCELLED);
        invitationRepository.save(inv);
    }

    @Transactional
    public void revokeRepresentative(UUID representativeId) {
        LegalEntityRepresentative rep = representativeRepository.findById(representativeId)
                .orElseThrow(() -> new IllegalArgumentException("Representante não encontrado"));
        rep.setStatus(RepresentativeStatus.INACTIVE);
        rep.setEndDate(LocalDate.now());
        representativeRepository.save(rep);
    }

    @Transactional(readOnly = true)
    public List<LegalEntity> getEntitiesForUser(UUID userId) {
        return representativeRepository.findByUserId(userId).stream()
                .filter(rep -> rep.getStatus() == RepresentativeStatus.ACTIVE)
                .map(LegalEntityRepresentative::getLegalEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LegalEntityRepresentative> getActiveRepresentativesForEntity(UUID legalEntityId) {
        return representativeRepository.findByLegalEntityId(legalEntityId).stream()
                .filter(rep -> rep.getStatus() == RepresentativeStatus.ACTIVE)
                .collect(Collectors.toList());
    }

    private RepresentativeResponseDTO mapToRepresentativeResponse(LegalEntityRepresentative rep) {
        return RepresentativeResponseDTO.builder()
                .id(rep.getId())
                .userId(rep.getUser().getId())
                .name(rep.getUser().getName())
                .email(rep.getUser().getEmail())
                .role(rep.getRole())
                .permissions(Objects.requireNonNullElse(rep.getPermissions(), new ArrayList<>()))
                .status(rep.getStatus())
                .startDate(rep.getStartDate())
                .endDate(rep.getEndDate())
                .createdAt(rep.getCreatedAt())
                .build();
    }

    private InvitationResponseDTO mapToInvitationResponse(RepresentativeInvitation inv) {
        return InvitationResponseDTO.builder()
                .id(inv.getId())
                .name(inv.getName())
                .email(inv.getEmail())
                .status(inv.getStatus())
                .role(inv.getRole())
                .permissions(Objects.requireNonNullElse(inv.getPermissions(), new ArrayList<>()))
                .expiresAt(inv.getExpiresAt())
                .createdAt(inv.getCreatedAt())
                .build();
    }
}
