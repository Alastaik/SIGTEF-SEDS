package br.gov.go.seds.sigtef.model;

public enum IssueStatus {
    OPEN("Aberta"),
    NOTIFIED("Notificada à Entidade"),
    ANSWERED("Respondida"),
    UNDER_REVIEW("Em Análise SEDS"),
    RESOLVED("Resolvida"),
    REJECTED_RESPONSE("Resposta Recusada"),
    EXPIRED("Prazo Vencido"),
    REOPENED("Reaberta"),
    CANCELED("Cancelada");

    private final String description;

    IssueStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
