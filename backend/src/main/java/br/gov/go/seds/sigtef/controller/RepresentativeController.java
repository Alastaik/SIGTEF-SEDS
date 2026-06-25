package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.representative.*;
import br.gov.go.seds.sigtef.service.RepresentativeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RepresentativeController {

    private final RepresentativeService representativeService;

    // --- Admin Endpoints (Require auth) ---

    @PostMapping("/admin/entities/{id}/representatives/invite")
    public ResponseEntity<Void> inviteRepresentative(
            @PathVariable UUID id,
            @RequestBody InviteRequestDTO request) {
        representativeService.inviteRepresentative(id, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/entities/{id}/representatives")
    public ResponseEntity<List<RepresentativeResponseDTO>> getRepresentatives(@PathVariable UUID id) {
        return ResponseEntity.ok(representativeService.getRepresentatives(id));
    }

    @GetMapping("/admin/entities/{id}/representatives/invitations")
    public ResponseEntity<List<InvitationResponseDTO>> getPendingInvitations(@PathVariable UUID id) {
        return ResponseEntity.ok(representativeService.getPendingInvitations(id));
    }

    @PutMapping("/admin/representatives/{repId}/revoke")
    public ResponseEntity<Void> revokeRepresentative(@PathVariable UUID repId) {
        representativeService.revokeRepresentative(repId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/invitations/{invId}/cancel")
    public ResponseEntity<Void> cancelInvitation(@PathVariable UUID invId) {
        representativeService.cancelInvitation(invId);
        return ResponseEntity.ok().build();
    }

    // --- Public Endpoints (No auth required) ---

    @PostMapping("/public/invitations/accept")
    public ResponseEntity<Void> acceptInvitation(@RequestBody AcceptInvitationRequestDTO request) {
        representativeService.acceptInvitation(request);
        return ResponseEntity.ok().build();
    }
}
