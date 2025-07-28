package com.harmony.harmoniservices.mappers;

import org.springframework.stereotype.Component;

import com.harmony.harmoniservices.dto.BpmnProcessDTO;
import com.harmony.harmoniservices.models.BpmnProcess;

@Component
public class BpmnProcessMapper {
    
    public BpmnProcess toEntity(BpmnProcessDTO processDto) {
        if (processDto == null) {
            return null;
        }
        
        return BpmnProcess.builder()
            .id(processDto.getId())
            .name(processDto.getName())
            .isExecutable(processDto.getIsExecutable())
            .description(processDto.getDescription())
            .keywords(String.join(",", processDto.getKeywords()))
            .imagePaths(processDto.getImagePaths())
            .filePaths(processDto.getFilePaths())
            .createdAt(processDto.getCreatedAt())
            .updatedAt(processDto.getUpdatedAt())
            .build();
    }
    
    public BpmnProcessDTO toDomain(BpmnProcess entity) {
        if (entity == null) {
            return null;
        }
        
        return BpmnProcessDTO.builder()
            .id(entity.getId())
            .name(entity.getName())
            .isExecutable(entity.getIsExecutable())
            .description(entity.getDescription())
            .keywords(entity.getKeywords())
            .imagePaths(entity.getImagePaths())
            .filePaths(entity.getFilePaths())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}