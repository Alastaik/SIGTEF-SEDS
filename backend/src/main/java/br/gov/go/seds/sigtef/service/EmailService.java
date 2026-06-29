package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.model.EmailQueue;
import br.gov.go.seds.sigtef.model.enums.EmailStatus;
import br.gov.go.seds.sigtef.repository.EmailQueueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final EmailQueueRepository emailQueueRepository;
    private final SystemTemplateService systemTemplateService;

    @Transactional
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        // User name is not passed here currently, we will just pass a generic or empty. Actually, reset email is just the link.
        java.util.Map<String, String> variables = java.util.Map.of(
            "nome", "Usuário",
            "link", resetLink
        );
        
        var templateOpt = systemTemplateService.findByKey("email.recuperacao_senha");
        String subject = templateOpt.map(t -> systemTemplateService.processTemplate(t.getSubject(), variables))
                .orElse("SIGTEF - Redefinição de Senha");
                
        String html = templateOpt.map(t -> systemTemplateService.processTemplate(t.getContent(), variables))
                .orElse("<p>Você solicitou a redefinição de senha do SIGTEF.</p>" +
                        "<p>Clique no link abaixo para redefinir sua senha (válido por 2 horas):</p>" +
                        "<a href=\"" + resetLink + "\">Redefinir Senha</a>");

        queueEmail(toEmail, subject, html);
    }

    @Transactional
    public void sendRepresentativeInvitationEmail(String toEmail, String name, String legalEntityName, String inviteLink) {
        java.util.Map<String, String> variables = java.util.Map.of(
            "nome", name,
            "link", inviteLink
        );
        
        var templateOpt = systemTemplateService.findByKey("email.convite_usuario");
        String subject = templateOpt.map(t -> systemTemplateService.processTemplate(t.getSubject(), variables))
                .orElse("Convite de Acesso - " + legalEntityName);
                
        String html = templateOpt.map(t -> systemTemplateService.processTemplate(t.getContent(), variables))
                .orElse("<p>Olá " + name + ",</p>" +
                        "<p>Você foi convidado para ser um representante da entidade <strong>" + legalEntityName + "</strong> no sistema SIGTEF.</p>" +
                        "<p>Clique no link abaixo para aceitar o convite e criar sua senha de acesso:</p>" +
                        "<a href=\"" + inviteLink + "\">Aceitar Convite</a>" +
                        "<p>Se você não sabe do que se trata, pode ignorar este e-mail.</p>");

        queueEmail(toEmail, subject, html);
    }
    
    @Transactional
    public void queueEmail(String recipient, String subject, String htmlBody) {
        EmailQueue email = EmailQueue.builder()
                .recipient(recipient)
                .subject(subject)
                .htmlBody(htmlBody)
                .status(EmailStatus.PENDING)
                .attemptCount(0)
                .build();
                
        emailQueueRepository.save(email);
    }
}
