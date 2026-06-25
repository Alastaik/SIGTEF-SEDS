package br.gov.go.seds.sigtef.model;

public enum IssuePriority {
    LOW("Baixa"),
    MEDIUM("Média"),
    HIGH("Alta"),
    CRITICAL("Crítica");

    private final String description;

    IssuePriority(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
