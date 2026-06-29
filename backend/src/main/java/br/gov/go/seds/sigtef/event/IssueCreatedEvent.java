package br.gov.go.seds.sigtef.event;

import java.util.UUID;

public record IssueCreatedEvent(
    UUID issueId,
    UUID accountabilityId,
    UUID legalEntityId,
    String issueType,
    String description
) {}
