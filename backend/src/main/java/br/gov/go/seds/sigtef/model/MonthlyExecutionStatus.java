package br.gov.go.seds.sigtef.model;

public enum MonthlyExecutionStatus {
    WAITING_TRANSFER("Aguardando Repasse"),
    READY_FOR_ACCOUNTABILITY("Pronto para Prestação de Contas"),
    ACCOUNTABILITY_DRAFT("Prestação em Rascunho"),
    SUBMITTED("Prestação Enviada"),
    UNDER_REVIEW("Em Análise SEDS"),
    PENDING_CORRECTION("Pendente de Correção"),
    RESUBMITTED("Reenviada após Correção"),
    APPROVED("Prestação Aprovada"),
    REJECTED("Prestação Reprovada"),
    CLOSED("Fechado"),
    BLOCKED("Bloqueado"),
    CANCELED("Cancelado"),
    ACCOUNTABILITY_CLOSED_UNREALIZED("Fechada sem Realização");

    private final String description;

    MonthlyExecutionStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
