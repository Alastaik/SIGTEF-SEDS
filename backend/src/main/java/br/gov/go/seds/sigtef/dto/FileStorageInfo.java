package br.gov.go.seds.sigtef.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileStorageInfo {
    private String storedFileName;
    private String originalFileName;
    private String mimeType;
    private Long fileSize;
    private String sha256Hash;
}
