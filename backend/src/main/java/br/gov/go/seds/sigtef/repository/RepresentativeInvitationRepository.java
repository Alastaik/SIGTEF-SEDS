package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.RepresentativeInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepresentativeInvitationRepository extends JpaRepository<RepresentativeInvitation, UUID> {
    List<RepresentativeInvitation> findByLegalEntityId(UUID legalEntityId);
    Optional<RepresentativeInvitation> findByToken(String token);
}
