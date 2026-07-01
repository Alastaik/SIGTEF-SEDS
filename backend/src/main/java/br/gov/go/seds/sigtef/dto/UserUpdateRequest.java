package br.gov.go.seds.sigtef.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;
import java.util.UUID;

@Getter
@Setter
public class UserUpdateRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @jakarta.validation.constraints.Size(min = 6, message = "A nova senha deve ter no mínimo 6 caracteres")
    private String password;

    @NotBlank
    private String userType;

    @NotNull
    private Boolean active;

    private Set<UUID> roleIds;
    
    private Set<UUID> entityScopeIds;
}
