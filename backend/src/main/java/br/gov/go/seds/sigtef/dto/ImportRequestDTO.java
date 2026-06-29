package br.gov.go.seds.sigtef.dto;

import br.gov.go.seds.sigtef.model.enums.ImportMode;
import br.gov.go.seds.sigtef.model.enums.ImportType;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ImportRequestDTO {
    private ImportType importType;
    private ImportMode mode;
    private MultipartFile file;
}
