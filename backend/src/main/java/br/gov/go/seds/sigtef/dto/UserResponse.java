package br.gov.go.seds.sigtef.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private String userType;
    private Boolean active;
    private LocalDateTime createdAt;
    private Set<String> roles;
    private Set<UUID> entityScopes;
}
