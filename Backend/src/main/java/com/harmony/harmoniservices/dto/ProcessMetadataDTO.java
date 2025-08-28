package com.harmony.harmoniservices.dto;

import lombok.*;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessMetadataDTO {
    private String processName;
    private String processDescription;
    private List<String> processTags = new ArrayList<>();
    private List<ProcessImageDTO> images = new ArrayList<>();
}
