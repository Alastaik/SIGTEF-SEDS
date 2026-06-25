package br.gov.go.seds.sigtef.mapper;

import br.gov.go.seds.sigtef.dto.UserDTO;
import br.gov.go.seds.sigtef.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    
    public UserDTO toDto(User user) {
        if (user == null) {
            return null;
        }
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}
