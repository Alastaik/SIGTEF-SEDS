package br.gov.go.seds.sigtef.event;

import java.util.UUID;

public record AccountabilitySubmittedEvent(
    UUID accountabilityId,
    UUID legalEntityId,
    String competence,
    String programName
) {}
