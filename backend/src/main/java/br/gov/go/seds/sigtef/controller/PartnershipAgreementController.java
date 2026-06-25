package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.agreement.AgreementProgramRequestDTO;
import br.gov.go.seds.sigtef.dto.agreement.AgreementProgramResponseDTO;
import br.gov.go.seds.sigtef.dto.agreement.AgreementRequestDTO;
import br.gov.go.seds.sigtef.dto.agreement.AgreementResponseDTO;
import br.gov.go.seds.sigtef.dto.agreement.SimulationResultDTO;
import br.gov.go.seds.sigtef.model.enums.AgreementStatus;
import br.gov.go.seds.sigtef.service.CalculationSimulatorService;
import br.gov.go.seds.sigtef.service.PartnershipAgreementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/agreements")
@RequiredArgsConstructor
public class PartnershipAgreementController {

    private final PartnershipAgreementService agreementService;
    private final CalculationSimulatorService simulatorService;

    @PostMapping
    public ResponseEntity<AgreementResponseDTO> createAgreement(@RequestBody AgreementRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(agreementService.createAgreement(request));
    }

    @GetMapping
    public ResponseEntity<List<AgreementResponseDTO>> getAllAgreements(
            @RequestParam(required = false) UUID legalEntityId) {
        if (legalEntityId != null) {
            return ResponseEntity.ok(agreementService.getAgreementsByEntity(legalEntityId));
        }
        return ResponseEntity.ok(agreementService.getAllAgreements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgreementResponseDTO> getAgreementById(@PathVariable UUID id) {
        return ResponseEntity.ok(agreementService.getAgreementById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgreementResponseDTO> updateAgreement(
            @PathVariable UUID id,
            @RequestBody AgreementRequestDTO request) {
        return ResponseEntity.ok(agreementService.updateAgreement(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> changeStatus(
            @PathVariable UUID id,
            @RequestParam AgreementStatus status) {
        agreementService.changeStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_GESTOR')")
    public ResponseEntity<Void> deleteAgreement(@PathVariable UUID id) {
        agreementService.deleteAgreement(id);
        return ResponseEntity.noContent().build();
    }

    // --- Programs ---

    @PostMapping("/{id}/programs")
    public ResponseEntity<AgreementProgramResponseDTO> addProgram(
            @PathVariable UUID id,
            @RequestBody AgreementProgramRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(agreementService.addProgram(id, request));
    }

    @GetMapping("/{id}/programs")
    public ResponseEntity<List<AgreementProgramResponseDTO>> getPrograms(@PathVariable UUID id) {
        return ResponseEntity.ok(agreementService.getPrograms(id));
    }

    @DeleteMapping("/programs/{programId}")
    public ResponseEntity<Void> removeProgram(@PathVariable UUID programId) {
        agreementService.removeProgram(programId);
        return ResponseEntity.noContent().build();
    }
}
