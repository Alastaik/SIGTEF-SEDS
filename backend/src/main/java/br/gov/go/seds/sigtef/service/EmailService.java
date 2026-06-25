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
                "from", "SIGTEF <no-reply@sigtef.com.br>",
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
    public void sendRepresentativeInvitationEmail(String toEmail, String name, String legalEntityName, String inviteLink) {
        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("RESEND_API_KEY não configurada. E-mail de convite não enviado para: " + toEmail);
            System.err.println("Link de convite: " + inviteLink);
            return;
        }

        Map<String, Object> body = Map.of(
                "from", "SIGTEF <no-reply@sigtef.com.br>",
                "to", List.of(toEmail),
                "subject", "Convite de Acesso - " + legalEntityName,
                "html", "<p>Olá " + name + ",</p>" +
                        "<p>Você foi convidado para ser um representante da entidade <strong>" + legalEntityName + "</strong> no sistema SIGTEF.</p>" +
                        "<p>Clique no link abaixo para aceitar o convite e criar sua senha de acesso:</p>" +
                        "<a href=\"" + inviteLink + "\">Aceitar Convite</a>" +
                        "<p>Se você não sabe do que se trata, pode ignorar este e-mail.</p>"
        );

        try {
            restClient.post()
                    .uri("/emails")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            System.out.println("E-mail de convite enviado para: " + toEmail);
        } catch (Exception e) {
            System.err.println("Erro ao enviar e-mail de convite pelo Resend: " + e.getMessage());
        }
    }
}
