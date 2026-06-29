package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.event.AccountabilityApprovedEvent;
import br.gov.go.seds.sigtef.event.AccountabilitySubmittedEvent;
import br.gov.go.seds.sigtef.event.IssueCreatedEvent;
import br.gov.go.seds.sigtef.model.LegalEntity;
import br.gov.go.seds.sigtef.model.Notification;
import br.gov.go.seds.sigtef.model.User;
import br.gov.go.seds.sigtef.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final RepresentativeService representativeService;
    // For now we will assume internal users are found by some role, 
    private final br.gov.go.seds.sigtef.repository.UserRepository userRepository;
    private final EmailService emailService;
    private final SystemTemplateService systemTemplateService;

    @EventListener
    @Transactional
    public void handleAccountabilitySubmittedEvent(AccountabilitySubmittedEvent event) {
        // Notificar analistas da SEDS (exemplo simplificado buscando admins ou role específico)
        // Aqui vou simplificar pegando todos os usuários que são ADMIN ou ANALISTA
        List<User> internalUsers = userRepository.findByUserType("INTERNO");
        
        for (User user : internalUsers) {
            Notification notification = Notification.builder()
                .user(user)
                .title("Nova Prestação de Contas Enviada")
                .message("A entidade enviou a prestação de contas de " + event.competence() + " do programa " + event.programName() + " para análise.")
                .type("ACCOUNTABILITY_SUBMITTED")
                .link("/admin/accountabilities/" + event.accountabilityId())
                .build();
            notificationRepository.save(notification);
            
            // Queue Email
            Map<String, String> variables = Map.of(
                "competencia", event.competence(),
                "programa", event.programName()
            );
            
            var templateOpt = systemTemplateService.findByKey("email.accountability.submitted");
            String subject = templateOpt.map(t -> systemTemplateService.processTemplate(t.getSubject(), variables))
                    .orElse("Nova Prestação de Contas - " + event.programName());
            
            String htmlBody = templateOpt.map(t -> systemTemplateService.processTemplate(t.getContent(), variables))
                    .orElse("<p>Olá,</p>" +
                            "<p>Uma nova prestação de contas foi enviada e aguarda análise.</p>" +
                            "<p><strong>Competência:</strong> " + event.competence() + "</p>" +
                            "<p><strong>Programa:</strong> " + event.programName() + "</p>" +
                            "<p>Acesse o sistema para analisar.</p>");
                            
            emailService.queueEmail(user.getEmail(), subject, htmlBody);
        }
    }

    @EventListener
    @Transactional
    public void handleAccountabilityApprovedEvent(AccountabilityApprovedEvent event) {
        // Notificar representantes da Entidade
        List<User> representatives = getActiveRepresentatives(event.legalEntityId());
        
        for (User user : representatives) {
            Notification notification = Notification.builder()
                .user(user)
                .title("Prestação de Contas Aprovada")
                .message("Sua prestação de contas de " + event.competence() + " do programa " + event.programName() + " foi aprovada.")
                .type("ACCOUNTABILITY_APPROVED")
                .link("/portal/accountabilities/" + event.accountabilityId())
                .build();
            notificationRepository.save(notification);

            // Queue Email
            Map<String, String> variables = Map.of(
                "nome", user.getName(),
                "competencia", event.competence(),
                "programa", event.programName()
            );

            var templateOpt = systemTemplateService.findByKey("email.accountability.approved");
            String subject = templateOpt.map(t -> systemTemplateService.processTemplate(t.getSubject(), variables))
                    .orElse("Prestação de Contas Aprovada - " + event.programName());

            String htmlBody = templateOpt.map(t -> systemTemplateService.processTemplate(t.getContent(), variables))
                    .orElse("<p>Olá " + user.getName() + ",</p>" +
                            "<p>Boas notícias! A prestação de contas de <strong>" + event.competence() + "</strong> do programa <strong>" + event.programName() + "</strong> foi aprovada.</p>" +
                            "<p>Acesse o Portal da Entidade no SIGTEF para ver os detalhes.</p>");
                            
            emailService.queueEmail(user.getEmail(), subject, htmlBody);
        }
    }

    @EventListener
    @Transactional
    public void handleIssueCreatedEvent(IssueCreatedEvent event) {
        // Notificar representantes da Entidade
        List<User> representatives = getActiveRepresentatives(event.legalEntityId());
        
        for (User user : representatives) {
            Notification notification = Notification.builder()
                .user(user)
                .title("Nova Pendência: " + event.issueType())
                .message("Foi registrada uma pendência na sua prestação de contas. Detalhes: " + event.description())
                .type("ISSUE_CREATED")
                .link("/portal/issues")
                .build();
            notificationRepository.save(notification);

            // Queue Email
            Map<String, String> variables = Map.of(
                "nome", user.getName(),
                "tipo_pendencia", event.issueType(),
                "detalhes", event.description()
            );

            var templateOpt = systemTemplateService.findByKey("email.issue.created");
            String subject = templateOpt.map(t -> systemTemplateService.processTemplate(t.getSubject(), variables))
                    .orElse("Nova Pendência - SIGTEF");

            String htmlBody = templateOpt.map(t -> systemTemplateService.processTemplate(t.getContent(), variables))
                    .orElse("<p>Olá " + user.getName() + ",</p>" +
                            "<p>Uma nova pendência do tipo <strong>" + event.issueType() + "</strong> foi registrada em sua prestação de contas.</p>" +
                            "<p><strong>Detalhes:</strong> " + event.description() + "</p>" +
                            "<p>Acesse o Portal da Entidade no SIGTEF para resolver a pendência e não travar o andamento da prestação.</p>");
                            
            emailService.queueEmail(user.getEmail(), subject, htmlBody);
        }
    }

    private List<User> getActiveRepresentatives(UUID legalEntityId) {
        // Busca os usuários ativos que representam a entidade.
        // Aqui poderíamos filtrar pelas permissões específicas.
        return representativeService.getActiveRepresentativesForEntity(legalEntityId).stream()
                .map(br.gov.go.seds.sigtef.model.LegalEntityRepresentative::getUser)
                .toList();
    }
}
