package br.gov.go.seds.sigtef.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private final RestClient restClient;
    private final String apiKey;

    public EmailService(@Value("${resend.api-key:}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("RESEND_API_KEY não configurada. E-mail de redefinição de senha não enviado para: " + toEmail);
            System.err.println("Link de redefinição: " + resetLink);
            return;
        }

        Map<String, Object> body = Map.of(
                "from", "onboarding@resend.dev",
                "to", List.of(toEmail),
                "subject", "SIGTEF - Redefinição de Senha",
                "html", "<p>Você solicitou a redefinição de senha do SIGTEF.</p>" +
                        "<p>Clique no link abaixo para redefinir sua senha (válido por 2 horas):</p>" +
                        "<a href=\"" + resetLink + "\">Redefinir Senha</a>"
        );

        try {
            restClient.post()
                    .uri("/emails")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            System.out.println("E-mail de redefinição enviado para: " + toEmail);
        } catch (Exception e) {
            System.err.println("Erro ao enviar e-mail pelo Resend: " + e.getMessage());
        }
    }
}
