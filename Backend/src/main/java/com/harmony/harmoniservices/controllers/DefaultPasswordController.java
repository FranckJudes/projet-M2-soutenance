package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.Requests.DefaultPasswordRequest;
import com.harmony.harmoniservices.dto.responses.DefaultPasswordResponse;
import com.harmony.harmoniservices.services.DefaultPasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/default-passwords")
@RequiredArgsConstructor
public class DefaultPasswordController {

    private final DefaultPasswordService defaultPasswordService;

    @GetMapping
    public ResponseEntity<List<DefaultPasswordResponse>> getAllDefaultPasswords() {
        return ResponseEntity.ok(defaultPasswordService.getAllDefaultPasswords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DefaultPasswordResponse> getDefaultPasswordById(@PathVariable Long id) {
        return ResponseEntity.ok(defaultPasswordService.getDefaultPasswordById(id));
    }

    @GetMapping("/active")
    public ResponseEntity<DefaultPasswordResponse> getActiveDefaultPassword() {
        return ResponseEntity.ok(defaultPasswordService.getActiveDefaultPassword());
    }

    @PostMapping
    public ResponseEntity<DefaultPasswordResponse> createDefaultPassword(
            @Valid @RequestBody DefaultPasswordRequest request) {
        return new ResponseEntity<>(defaultPasswordService.createDefaultPassword(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DefaultPasswordResponse> updateDefaultPassword(
            @PathVariable Long id,
            @Valid @RequestBody DefaultPasswordRequest request) {
        return ResponseEntity.ok(defaultPasswordService.updateDefaultPassword(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDefaultPassword(@PathVariable Long id) {
        defaultPasswordService.deleteDefaultPassword(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<DefaultPasswordResponse> activateDefaultPassword(@PathVariable Long id) {
        return ResponseEntity.ok(defaultPasswordService.activateDefaultPassword(id));
    }
}
