package com.harmony.harmoniservices.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.harmony.harmoniservices.models.BpmnData;
import com.harmony.harmoniservices.dto.responses.ApiResponse;
import com.harmony.harmoniservices.services.BpmnServiceImpl;

@RestController
@RequestMapping("/bpmn")

public class BpmnController {

    private final BpmnServiceImpl bpmnService;

    public BpmnController(BpmnServiceImpl bpmnService) {
        this.bpmnService = bpmnService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<BpmnData>> uploadBpmnFile(@RequestParam("file") MultipartFile file) {
        try {
            BpmnData bpmnData = bpmnService.parseBpmnFile(file.getInputStream());
            return ResponseEntity.ok(ApiResponse.success("Fichier BPMN traité avec succès", bpmnData));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail("Erreur lors du traitement du fichier BPMN: " + e.getMessage()));
        }
    }
    
}
