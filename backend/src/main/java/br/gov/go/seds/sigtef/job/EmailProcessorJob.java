package br.gov.go.seds.sigtef.job;

import br.gov.go.seds.sigtef.model.EmailQueue;
import br.gov.go.seds.sigtef.model.enums.EmailStatus;
import br.gov.go.seds.sigtef.repository.EmailQueueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailProcessorJob {

    private final EmailQueueRepository emailQueueRepository;

    @Value("${resend.api-key:}")
    private String apiKey;

    private RestClient restClient;
    private static final int MAX_ATTEMPTS = 3;
    private static final int BATCH_SIZE = 20;

    @PostConstruct
    public void init() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    // Runs every 1 minute
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void processEmailQueue() {
        List<EmailQueue> emailsToProcess = emailQueueRepository.findEmailsToProcess(
                List.of(EmailStatus.PENDING, EmailStatus.FAILED),
                MAX_ATTEMPTS,
                PageRequest.of(0, BATCH_SIZE)
        );

        if (emailsToProcess.isEmpty()) {
            return;
        }

        log.info("Processing {} emails in queue...", emailsToProcess.size());

        for (EmailQueue email : emailsToProcess) {
            email.setAttemptCount(email.getAttemptCount() + 1);
            email.setLastAttemptAt(LocalDateTime.now());

            if (apiKey == null || apiKey.isBlank()) {
                log.warn("RESEND_API_KEY is not configured. Email will be marked as failed.");
                email.setStatus(EmailStatus.FAILED);
                email.setErrorMsg("RESEND_API_KEY is not configured");
                emailQueueRepository.save(email);
                continue;
            }

            try {
                Map<String, Object> body = Map.of(
                        "from", "SIGTEF <no-reply@sigtef.com.br>",
                        "to", List.of(email.getRecipient()),
                        "subject", email.getSubject(),
                        "html", email.getHtmlBody()
                );

                restClient.post()
                        .uri("/emails")
                        .body(body)
                        .retrieve()
                        .toBodilessEntity();

                email.setStatus(EmailStatus.SENT);
                email.setErrorMsg(null);
                log.info("Email sent successfully to {}", email.getRecipient());
            } catch (Exception e) {
                log.error("Failed to send email to {}", email.getRecipient(), e);
                email.setStatus(EmailStatus.FAILED);
                email.setErrorMsg(e.getMessage());
            }

            emailQueueRepository.save(email);
        }
    }
}
