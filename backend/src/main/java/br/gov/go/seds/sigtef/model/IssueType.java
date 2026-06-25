package br.gov.go.seds.sigtef.model;

public enum IssueType {
    DOCUMENT_MISSING("Documento Faltante"),
    DOCUMENT_ILLEGIBLE("Documento Ilegível"),
    INVALID_INVOICE("Nota Fiscal Inválida"),
    VALUE_DIVERGENCE("Divergência de Valores"),
    INVALID_CONSUMER_UNIT("Unidade Consumidora Divergente"),
    WRONG_CATEGORY("Categoria/Rubrica Incorreta"),
    OTHER("Outro");

    private final String description;

    IssueType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
