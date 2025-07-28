package com.harmony.harmoniservices.dto.Requests;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GroupeRequest(
        @Schema(description = "Name of the group", example = "Admin Group")
        @NotBlank(message = "Name is mandatory")
        @NotNull(message = "Name cannot be null")
        String name,

        @Schema(description = "Description of the group", example = "This group has admin privileges")
        @NotBlank(message = "Description is mandatory")
        @NotNull(message = "Description cannot be null")
        String description,
        
        String type
) {
   
} 
