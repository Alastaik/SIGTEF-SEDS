package br.gov.go.seds.sigtef.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class UserInfoResponse {
    private UUID id;
    private String name;
    private String email;
    private String userType;
    private List<String> authorities;
    private Set<UUID> allowedEntities;
}
