package br.gov.go.seds.sigtef.security;

import br.gov.go.seds.sigtef.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@AllArgsConstructor
@Getter
public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private UUID id;
    private String name;
    private String email;

    @JsonIgnore
    private String password;

    private String userType;
    private boolean active;
    private LocalDateTime lockedUntil;
    
    // Lista de UUIDs das entidades vinculadas a este usuário (se for EXTERNO)
    private Set<UUID> allowedEntities;

    private Collection<? extends GrantedAuthority> authorities;

    public static UserDetailsImpl build(User user) {
        // Mapeando Roles e Permissões para GrantedAuthorities
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .flatMap(role -> {
                    Set<GrantedAuthority> auths = role.getPermissions().stream()
                            .map(p -> new SimpleGrantedAuthority(p.getName()))
                            .collect(Collectors.toSet());
                    auths.add(new SimpleGrantedAuthority(role.getName()));
                    return auths.stream();
                })
                .collect(Collectors.toList());

        Set<UUID> entityIds = user.getEntityScopes().stream()
                .map(scope -> scope.getEntityId())
                .collect(Collectors.toSet());

        return new UserDetailsImpl(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPassword(),
                user.getUserType(),
                user.getActive(),
                user.getLockedUntil(),
                entityIds,
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email; // O login será feito pelo e-mail
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        if (!active) return false;
        if (lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now())) return false;
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
