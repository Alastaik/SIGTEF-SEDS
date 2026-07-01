package br.gov.go.seds.sigtef.model.enums;

public enum ProgramStatus {
    ACTIVE("Ativo"),
    SUSPENDED("Suspenso"),
    CANCELED("Cancelado");

    private final String description;

    ProgramStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
