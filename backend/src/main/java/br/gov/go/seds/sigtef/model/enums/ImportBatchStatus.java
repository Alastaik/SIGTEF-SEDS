package br.gov.go.seds.sigtef.model.enums;

public enum ImportBatchStatus {
    UPLOADED,
    PARSING,
    PARSED,
    VALIDATING,
    VALIDATED,
    READY_TO_APPLY,
    APPLYING,
    APPLIED,
    PARTIALLY_APPLIED,
    FAILED,
    CANCELED
}
