package br.gov.go.seds.sigtef.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CleanupTaskService {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    /**
     * Executa todo domingo às 03:00 da manhã.
     * Limpa arquivos órfãos (arquivos que estão na pasta de uploads temp
     * ou arquivos muito antigos que não deveriam estar lá).
     * No caso deste sistema, arquivos no 'uploadDir/temp' com mais de 7 dias são deletados.
     */
    @Scheduled(cron = "0 0 3 * * SUN")
    public void purgeTemporaryFiles() {
        log.info("Iniciando rotina de limpeza de arquivos temporários...");
        Path tempPath = Paths.get(uploadDir, "temp");
        
        if (!Files.exists(tempPath) || !Files.isDirectory(tempPath)) {
            log.info("Diretório temporário não encontrado, nada a limpar.");
            return;
        }

        try {
            Instant threshold = Instant.now().minus(7, ChronoUnit.DAYS);
            
            Files.walk(tempPath)
                 .filter(Files::isRegularFile)
                 .forEach(file -> {
                     try {
                         Instant lastModified = Files.getLastModifiedTime(file).toInstant();
                         if (lastModified.isBefore(threshold)) {
                             Files.delete(file);
                             log.info("Arquivo temporário expirado removido: {}", file.getFileName());
                         }
                     } catch (IOException e) {
                         log.error("Falha ao remover arquivo {}", file.getFileName(), e);
                     }
                 });
                 
            log.info("Rotina de limpeza de arquivos temporários concluída.");
        } catch (IOException e) {
            log.error("Erro ao ler diretório de uploads temporários", e);
        }
    }
}
