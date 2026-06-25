package br.gov.go.seds.sigtef.model;

public enum CalculationType {
    POR_META("Por Meta"),
    VALOR_FIXO("Valor Fixo"),
    REEMBOLSO("Reembolso"),
    LIMITE_MENSAL("Limite Mensal");

    private final String description;

    CalculationType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
