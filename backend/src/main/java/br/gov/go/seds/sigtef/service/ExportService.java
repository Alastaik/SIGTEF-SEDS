package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.admin.EntityReportDTO;
import br.gov.go.seds.sigtef.dto.admin.ReportFilterDTO;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final ReportService reportService;

    public byte[] exportEntitiesToExcel(ReportFilterDTO filter) throws IOException {
        List<EntityReportDTO> data = reportService.getAllEntitiesForExport(filter);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Entidades");

            // Estilo do cabeçalho
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Cabeçalho
            String[] headers = {
                "Nome / Razão Social", "CNPJ", "Status", "Município", "Região",
                "Programas Ativos", "Termos Ativos", "Total de Termos", "Total Repassado (R$)"
            };
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Dados
            CellStyle currencyStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            currencyStyle.setDataFormat(format.getFormat("#,##0.00"));

            int rowIdx = 1;
            for (EntityReportDTO item : data) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(item.getName());
                row.createCell(1).setCellValue(item.getCnpj());
                row.createCell(2).setCellValue(item.getStatus());
                row.createCell(3).setCellValue(item.getCity());
                row.createCell(4).setCellValue(item.getRegion());
                row.createCell(5).setCellValue(
                    item.getActivePrograms() != null ? String.join(", ", item.getActivePrograms()) : ""
                );
                row.createCell(6).setCellValue(item.getActiveAgreements());
                row.createCell(7).setCellValue(item.getTotalAgreements());

                Cell valueCell = row.createCell(8);
                BigDecimal total = item.getTotalTransferred();
                valueCell.setCellValue(total != null ? total.doubleValue() : 0.0);
                valueCell.setCellStyle(currencyStyle);
            }

            // Larguras fixas por coluna (em unidades POI: 256 * número de caracteres aprox.)
            // autoSizeColumn é O(n) e pode congelar com 10k+ linhas
            int[] colWidths = {6000, 15000, 10000, 8000, 8000, 20000, 6000, 6000, 12000};
            for (int i = 0; i < headers.length; i++) {
                sheet.setColumnWidth(i, colWidths[i]);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportEntitiesToCsv(ReportFilterDTO filter) {
        List<EntityReportDTO> data = reportService.getAllEntitiesForExport(filter);

        StringBuilder sb = new StringBuilder();
        // BOM para UTF-8 (garante acentos no Excel ao abrir CSV)
        sb.append('\uFEFF');
        // Cabeçalho
        sb.append("Nome;CNPJ;Status;Município;Região;Programas Ativos;Termos Ativos;Total Termos;Total Repassado\n");

        for (EntityReportDTO item : data) {
            sb.append(escapeCsv(item.getName())).append(';');
            sb.append(escapeCsv(item.getCnpj())).append(';');
            sb.append(escapeCsv(item.getStatus())).append(';');
            sb.append(escapeCsv(item.getCity())).append(';');
            sb.append(escapeCsv(item.getRegion())).append(';');
            String programs = item.getActivePrograms() != null
                ? String.join(" | ", item.getActivePrograms()) : "";
            sb.append(escapeCsv(programs)).append(';');
            sb.append(item.getActiveAgreements()).append(';');
            sb.append(item.getTotalAgreements()).append(';');
            BigDecimal total = item.getTotalTransferred();
            sb.append(total != null ? total.toPlainString() : "0.00");
            sb.append('\n');
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportExecutionsToExcel(br.gov.go.seds.sigtef.dto.admin.ExecutionReportFilterDTO filter) throws IOException {
        List<br.gov.go.seds.sigtef.dto.admin.ExecutionReportDTO> data = reportService.getAllExecutionsForExport(filter);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Prestacoes");
            CellStyle headerStyle = createHeaderStyle(workbook);
            String[] headers = {"Competência", "Entidade", "Termo", "Programa", "Status", "Valor Previsto", "Valor Repassado", "Data Repasse"};
            createHeaderRow(sheet, headerStyle, headers);
            
            CellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));

            int rowIdx = 1;
            for (br.gov.go.seds.sigtef.dto.admin.ExecutionReportDTO item : data) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(item.getCompetence());
                row.createCell(1).setCellValue(item.getEntityName());
                row.createCell(2).setCellValue(item.getAgreementNumber());
                row.createCell(3).setCellValue(item.getProgramName());
                row.createCell(4).setCellValue(item.getStatus());
                
                Cell prev = row.createCell(5);
                prev.setCellValue(item.getExpectedValue() != null ? item.getExpectedValue().doubleValue() : 0.0);
                prev.setCellStyle(currencyStyle);
                
                Cell rep = row.createCell(6);
                rep.setCellValue(item.getTransferredValue() != null ? item.getTransferredValue().doubleValue() : 0.0);
                rep.setCellStyle(currencyStyle);
                
                row.createCell(7).setCellValue(item.getTransferDate());
            }
            autoSizeColumns(sheet, headers.length);
            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportExecutionsToCsv(br.gov.go.seds.sigtef.dto.admin.ExecutionReportFilterDTO filter) {
        List<br.gov.go.seds.sigtef.dto.admin.ExecutionReportDTO> data = reportService.getAllExecutionsForExport(filter);
        StringBuilder sb = new StringBuilder();
        sb.append('\uFEFF');
        sb.append("Competencia;Entidade;Termo;Programa;Status;Valor Previsto;Valor Repassado;Data Repasse\n");
        for (br.gov.go.seds.sigtef.dto.admin.ExecutionReportDTO item : data) {
            sb.append(escapeCsv(item.getCompetence())).append(';');
            sb.append(escapeCsv(item.getEntityName())).append(';');
            sb.append(escapeCsv(item.getAgreementNumber())).append(';');
            sb.append(escapeCsv(item.getProgramName())).append(';');
            sb.append(escapeCsv(item.getStatus())).append(';');
            sb.append(item.getExpectedValue() != null ? item.getExpectedValue().toPlainString() : "0.00").append(';');
            sb.append(item.getTransferredValue() != null ? item.getTransferredValue().toPlainString() : "0.00").append(';');
            sb.append(escapeCsv(item.getTransferDate())).append('\n');
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportIssuesToExcel(br.gov.go.seds.sigtef.dto.admin.IssueReportFilterDTO filter) throws IOException {
        List<br.gov.go.seds.sigtef.dto.admin.IssueReportDTO> data = reportService.getAllIssuesForExport(filter);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Pendencias");
            CellStyle headerStyle = createHeaderStyle(workbook);
            String[] headers = {"Entidade", "Termo", "Competência", "Status", "Prioridade", "Tipo", "Prazo", "Resolvido Em", "Atrasado?", "Descrição"};
            createHeaderRow(sheet, headerStyle, headers);

            int rowIdx = 1;
            for (br.gov.go.seds.sigtef.dto.admin.IssueReportDTO item : data) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(item.getEntityName());
                row.createCell(1).setCellValue(item.getAgreementNumber());
                row.createCell(2).setCellValue(item.getCompetence());
                row.createCell(3).setCellValue(item.getStatus());
                row.createCell(4).setCellValue(item.getPriority());
                row.createCell(5).setCellValue(item.getIssueType());
                row.createCell(6).setCellValue(item.getDeadline());
                row.createCell(7).setCellValue(item.getResolvedAt());
                row.createCell(8).setCellValue(item.isOverdue() ? "SIM" : "NÃO");
                row.createCell(9).setCellValue(item.getDescription());
            }
            autoSizeColumns(sheet, headers.length);
            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportIssuesToCsv(br.gov.go.seds.sigtef.dto.admin.IssueReportFilterDTO filter) {
        List<br.gov.go.seds.sigtef.dto.admin.IssueReportDTO> data = reportService.getAllIssuesForExport(filter);
        StringBuilder sb = new StringBuilder();
        sb.append('\uFEFF');
        sb.append("Entidade;Termo;Competencia;Status;Prioridade;Tipo;Prazo;Resolvido Em;Atrasado;Descricao\n");
        for (br.gov.go.seds.sigtef.dto.admin.IssueReportDTO item : data) {
            sb.append(escapeCsv(item.getEntityName())).append(';');
            sb.append(escapeCsv(item.getAgreementNumber())).append(';');
            sb.append(escapeCsv(item.getCompetence())).append(';');
            sb.append(escapeCsv(item.getStatus())).append(';');
            sb.append(escapeCsv(item.getPriority())).append(';');
            sb.append(escapeCsv(item.getIssueType())).append(';');
            sb.append(escapeCsv(item.getDeadline())).append(';');
            sb.append(escapeCsv(item.getResolvedAt())).append(';');
            sb.append(item.isOverdue() ? "SIM" : "NAO").append(';');
            sb.append(escapeCsv(item.getDescription())).append('\n');
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        return headerStyle;
    }

    private void createHeaderRow(Sheet sheet, CellStyle headerStyle, String[] headers) {
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void autoSizeColumns(Sheet sheet, int count) {
        for (int i = 0; i < count; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(";") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
