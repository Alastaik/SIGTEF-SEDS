package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.CreateAddendumDTO;
import br.gov.go.seds.sigtef.dto.PartnershipAgreementAddendumDTO;
import br.gov.go.seds.sigtef.model.enums.AddendumStatus;
import br.gov.go.seds.sigtef.service.PartnershipAgreementAddendumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/agreements")
@RequiredArgsConstructor
public class PartnershipAgreementAddendumController {

    private final PartnershipAgreementAddendumService addendumService;

    @GetMapping("/{agreementId}/addendums")
    @PreAuthorize("hasAuthority('agreements:view') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_GESTOR')")
    public ResponseEntity<List<PartnershipAgreementAddendumDTO>> listAddendums(@PathVariable UUID agreementId) {
        return ResponseEntity.ok(addendumService.findByAgreementId(agreementId));
    }

    @PostMapping("/addendums")
    @PreAuthorize("hasAuthority('agreements:create') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PartnershipAgreementAddendumDTO> createAddendum(@Valid @RequestBody CreateAddendumDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(addendumService.create(dto));
    }

    @PatchMapping("/addendums/{id}/status")
    @PreAuthorize("hasAuthority('agreements:edit') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PartnershipAgreementAddendumDTO> changeStatus(
            @PathVariable UUID id,
            @RequestParam AddendumStatus status) {
        return ResponseEntity.ok(addendumService.changeStatus(id, status));
    }

    @DeleteMapping("/addendums/{id}")
    @PreAuthorize("hasAuthority('agreements:delete') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteAddendum(@PathVariable UUID id) {
        addendumService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
