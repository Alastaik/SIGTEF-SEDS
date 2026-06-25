package br.gov.go.seds.sigtef.model;

public enum IssueResponseStatus {
    SUBMITTED("Enviada"),
    UNDER_REVIEW("Em Análise"),
    ACCEPTED("Aceita"),
    REJECTED("Recusada"),
    CANCELED("Cancelada");

    private final String description;

    IssueResponseStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
