package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.dto.admin.AgreementReportDTO;
import br.gov.go.seds.sigtef.dto.admin.AgreementReportFilterDTO;
import br.gov.go.seds.sigtef.dto.admin.EntityReportDTO;
import br.gov.go.seds.sigtef.dto.admin.ReportFilterDTO;
import br.gov.go.seds.sigtef.service.ExportService;
import br.gov.go.seds.sigtef.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final ExportService exportService;

    @GetMapping("/entities")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<Page<EntityReportDTO>> getEntityReport(ReportFilterDTO filter, Pageable pageable) {
        return ResponseEntity.ok(reportService.getEntityReport(filter, pageable));
    }

    @GetMapping("/agreements")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<Page<AgreementReportDTO>> getAgreementReport(
            AgreementReportFilterDTO filter, Pageable pageable) {
        return ResponseEntity.ok(reportService.getAgreementReport(filter, pageable));
    }

    @GetMapping("/entities/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<byte[]> exportEntities(
            ReportFilterDTO filter,
            @RequestParam(defaultValue = "xlsx") String format) throws IOException {
        String filename = "entidades_" + LocalDate.now() + "." + format;
        if ("csv".equalsIgnoreCase(format)) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
                    .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                    .body(exportService.exportEntitiesToCsv(filter));
        } else {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(exportService.exportEntitiesToExcel(filter));
        }
    }

    @GetMapping("/executions")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<Page<br.gov.go.seds.sigtef.dto.admin.ExecutionReportDTO>> getExecutionReport(
            br.gov.go.seds.sigtef.dto.admin.ExecutionReportFilterDTO filter, Pageable pageable) {
        return ResponseEntity.ok(reportService.getExecutionReport(filter, pageable));
    }

    @GetMapping("/executions/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<byte[]> exportExecutions(
            br.gov.go.seds.sigtef.dto.admin.ExecutionReportFilterDTO filter,
            @RequestParam(defaultValue = "xlsx") String format) throws IOException {
        String filename = "prestacoes_" + LocalDate.now() + "." + format;
        if ("csv".equalsIgnoreCase(format)) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
                    .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                    .body(exportService.exportExecutionsToCsv(filter));
        } else {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(exportService.exportExecutionsToExcel(filter));
        }
    }

    @GetMapping("/issues")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<Page<br.gov.go.seds.sigtef.dto.admin.IssueReportDTO>> getIssueReport(
            br.gov.go.seds.sigtef.dto.admin.IssueReportFilterDTO filter, Pageable pageable) {
        return ResponseEntity.ok(reportService.getIssueReport(filter, pageable));
    }

    @GetMapping("/issues/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTOR') or hasRole('SEDS')")
    public ResponseEntity<byte[]> exportIssues(
            br.gov.go.seds.sigtef.dto.admin.IssueReportFilterDTO filter,
            @RequestParam(defaultValue = "xlsx") String format) throws IOException {
        String filename = "pendencias_" + LocalDate.now() + "." + format;
        if ("csv".equalsIgnoreCase(format)) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
                    .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                    .body(exportService.exportIssuesToCsv(filter));
        } else {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(exportService.exportIssuesToExcel(filter));
        }
    }
}

