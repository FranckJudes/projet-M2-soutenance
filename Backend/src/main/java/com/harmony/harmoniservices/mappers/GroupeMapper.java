package com.harmony.harmoniservices.mappers;

import com.harmony.harmoniservices.dto.GroupeUtilisateurDTO;
import com.harmony.harmoniservices.enums.TypeGroupe;
import com.harmony.harmoniservices.models.GroupeEntity;
import org.springframework.stereotype.Component;

@Component
public class GroupeMapper {

    public GroupeUtilisateurDTO toDomain(GroupeEntity entity) {
        if (entity == null) {
            return null;
        }
        return GroupeUtilisateurDTO.builder()
                .id(entity.getId())
                .libeleGroupeUtilisateur(entity.getLibele_groupe_utilisateur())
                .type(entity.getType() != null ? entity.getType().name() : null)
                .descriptionGroupeUtilisateur(entity.getDescription_groupe_utilisateur())
                .build();
    }

    public GroupeEntity toEntity(GroupeUtilisateurDTO domain) {
        if (domain == null) {
            return null;
        }
        return GroupeEntity.builder()
                .id(domain.getId())
                .libele_groupe_utilisateur(domain.getLibeleGroupeUtilisateur())
                .type(domain.getType() != null ? TypeGroupe.valueOf(domain.getType()) : TypeGroupe.TYPE_0)
                .description_groupe_utilisateur(domain.getDescriptionGroupeUtilisateur())
                .build();
    }
}