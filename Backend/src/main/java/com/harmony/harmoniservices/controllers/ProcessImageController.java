package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.services.ProcessEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/process-images")
@RequiredArgsConstructor
public class ProcessImageController {

    private final ProcessEngineService processEngineService;

    /**
     * Sert les images des processus depuis le système de fichiers
     */
    @GetMapping("/{processKey}/{fileName:.+}")
    public ResponseEntity<Resource> getProcessImage(
            @PathVariable String processKey,
            @PathVariable String fileName) {

        try {
            // Construire le chemin vers l'image
            Path imagePath = Paths.get("src/main/resources/static/process-images", processKey, fileName);
            Resource resource = new UrlResource(imagePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // Déterminer le type de contenu basé sur l'extension du fichier
                String contentType = determineContentType(fileName);

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Détermine le type de contenu basé sur l'extension du fichier
     */
    private String determineContentType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "bmp":
                return "image/bmp";
            case "webp":
                return "image/webp";
            default:
                return "application/octet-stream";
        }
    }
}
