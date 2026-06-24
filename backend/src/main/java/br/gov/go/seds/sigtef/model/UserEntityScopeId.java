package br.gov.go.seds.sigtef.model;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserEntityScopeId implements Serializable {
    private UUID user;
    private UUID entityId;
}
