package com.harmony.harmoniservices.mappers;

import com.harmony.harmoniservices.dto.DefaultPasswordDto;
import com.harmony.harmoniservices.dto.Requests.DefaultPasswordRequest;
import com.harmony.harmoniservices.dto.responses.DefaultPasswordResponse;
import com.harmony.harmoniservices.models.DefaultPassword;
import org.springframework.stereotype.Component;

@Component
public class DefaultPasswordMapper {
    
    public DefaultPasswordDto toDto(DefaultPassword defaultPassword) {
        if (defaultPassword == null) {
            return null;
        }
        
        return DefaultPasswordDto.builder()
                .id(defaultPassword.getId())
                .libelle(defaultPassword.getLibelle())
                .valeur(defaultPassword.getValeur())
                .dateCreation(defaultPassword.getDateCreation())
                .active(defaultPassword.isActive())
                .build();
    }
    
    public DefaultPassword toEntity(DefaultPasswordDto dto) {
        if (dto == null) {
            return null;
        }
        
        return DefaultPassword.builder()
                .id(dto.getId())
                .libelle(dto.getLibelle())
                .valeur(dto.getValeur())
                .dateCreation(dto.getDateCreation())
                .active(dto.isActive())
                .build();
    }
    
    public DefaultPasswordResponse toResponse(DefaultPassword defaultPassword) {
        if (defaultPassword == null) {
            return null;
        }
        
        return DefaultPasswordResponse.builder()
                .id(defaultPassword.getId())
                .libelle(defaultPassword.getLibelle())
                .valeur(defaultPassword.getValeur())
                .dateCreation(defaultPassword.getDateCreation())
                .active(defaultPassword.isActive())
                .build();
    }
    
    public DefaultPassword fromRequest(DefaultPasswordRequest request) {
        if (request == null) {
            return null;
        }
        
        return DefaultPassword.builder()
                .libelle(request.getLibelle())
                .valeur(request.getValeur())
                .build();
    }
}
