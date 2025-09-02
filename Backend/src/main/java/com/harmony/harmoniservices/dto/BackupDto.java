package com.harmony.harmoniservices.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BackupDto {
    private Long id;
    private String name;
    private String filePath;
    private Long size;
    private LocalDateTime createdAt;
    private String status;
}
