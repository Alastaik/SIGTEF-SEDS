package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.FileStorageInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Não foi possível criar o diretório onde os arquivos serão armazenados.", ex);
        }
    }

    public FileStorageInfo storeFileWithHash(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String fileExtension = "";
        
        try {
            if(originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            String targetFileName = UUID.randomUUID().toString() + fileExtension;
            Path targetLocation = this.fileStorageLocation.resolve(targetFileName);
            
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            String hash = calculateSHA256(targetLocation);

            return FileStorageInfo.builder()
                    .storedFileName(targetFileName)
                    .originalFileName(originalFileName)
                    .mimeType(file.getContentType())
                    .fileSize(file.getSize())
                    .sha256Hash(hash)
                    .build();
            
        } catch (IOException | NoSuchAlgorithmException ex) {
            throw new RuntimeException("Não foi possível armazenar o arquivo " + originalFileName + ". Tente novamente!", ex);
        }
    }

    private String calculateSHA256(Path path) throws IOException, NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream is = Files.newInputStream(path)) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = is.read(buffer)) > 0) {
                digest.update(buffer, 0, read);
            }
        }
        byte[] hashBytes = digest.digest();
        StringBuilder hexString = new StringBuilder();
        for (byte b : hashBytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new RuntimeException("Acesso negado: caminho fora do diretório de uploads.");
            }
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("Arquivo não encontrado: " + fileName);
            }
        } catch (Exception ex) {
            throw new RuntimeException("Arquivo não encontrado: " + fileName, ex);
        }
    }

    public void deleteFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new RuntimeException("Acesso negado: caminho fora do diretório de uploads.");
            }
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Erro ao deletar arquivo físico: " + fileName, ex);
        }
    }
}
