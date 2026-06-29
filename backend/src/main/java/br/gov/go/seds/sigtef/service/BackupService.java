package br.gov.go.seds.sigtef.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class BackupService {

    /**
     * Aciona o script de backup assincronamente (se existir no sistema operacional)
     * e retorna um CompletableFuture com o resultado.
     */
    public CompletableFuture<String> executeManualBackup() {
        return CompletableFuture.supplyAsync(() -> {
            log.info("Iniciando rotina de backup manual...");
            
            // Verifica caminhos prováveis do script
            String[] possiblePaths = {
                    "/opt/sigtef/backup.sh",
                    "/app/backup.sh",
                    "./backup.sh"
            };
            
            String scriptPath = null;
            for (String path : possiblePaths) {
                if (Files.exists(Paths.get(path))) {
                    scriptPath = path;
                    break;
                }
            }

            if (scriptPath == null) {
                log.warn("Script de backup não encontrado nos caminhos padrão. Simulando execução...");
                try {
                    // Simulação para o ambiente de desenvolvimento local no Windows
                    Thread.sleep(3000); 
                    return "Simulação de backup concluída (Script não encontrado, rodando em dev).";
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return "Falha na simulação de backup.";
                }
            }

            // Executar o script bash
            try {
                ProcessBuilder processBuilder = new ProcessBuilder("bash", scriptPath);
                processBuilder.redirectErrorStream(true);
                Process process = processBuilder.start();

                StringBuilder output = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        output.append(line).append("\n");
                    }
                }

                int exitCode = process.waitFor();
                if (exitCode == 0) {
                    log.info("Backup concluído com sucesso. Saída:\n{}", output.toString());
                    return "Backup concluído com sucesso!";
                } else {
                    log.error("Erro na execução do script de backup. Código: {}. Saída:\n{}", exitCode, output.toString());
                    throw new RuntimeException("Falha ao executar o backup. Código: " + exitCode);
                }
            } catch (Exception e) {
                log.error("Erro ao invocar processo de backup", e);
                throw new RuntimeException("Falha de infraestrutura ao rodar o backup.", e);
            }
        });
    }
}
