package br.gov.go.seds.sigtef.model.enums;

public enum AccountabilityStatus {
    DRAFT("Rascunho"),
    SUBMITTED("Enviada"),
    UNDER_REVIEW("Em Análise"),
    PENDING_CORRECTION("Pendente de Correção"),
    RESUBMITTED("Reenviada"),
    APPROVED("Aprovada"),
    REJECTED("Reprovada"),
    CANCELED("Cancelada"),
    CLOSED("Fechada"),
    CLOSED_UNREALIZED("Fechada sem realização");

    private final String description;

    AccountabilityStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
