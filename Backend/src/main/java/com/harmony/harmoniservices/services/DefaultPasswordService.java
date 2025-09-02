package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.dto.DefaultPasswordDto;
import com.harmony.harmoniservices.dto.Requests.DefaultPasswordRequest;
import com.harmony.harmoniservices.dto.responses.DefaultPasswordResponse;
import com.harmony.harmoniservices.exceptions.ResourceNotFoundException;
import com.harmony.harmoniservices.mappers.DefaultPasswordMapper;
import com.harmony.harmoniservices.models.DefaultPassword;
import com.harmony.harmoniservices.repository.DefaultPasswordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DefaultPasswordService {

    private final DefaultPasswordRepository defaultPasswordRepository;
    private final DefaultPasswordMapper defaultPasswordMapper;

    public List<DefaultPasswordResponse> getAllDefaultPasswords() {
        return defaultPasswordRepository.findAll().stream()
                .map(defaultPasswordMapper::toResponse)
                .collect(Collectors.toList());
    }

    public DefaultPasswordResponse getDefaultPasswordById(Long id) {
        DefaultPassword defaultPassword = defaultPasswordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mot de passe par défaut non trouvé avec l'ID: " + id));
        return defaultPasswordMapper.toResponse(defaultPassword);
    }

    public DefaultPasswordResponse getActiveDefaultPassword() {
        DefaultPassword defaultPassword = defaultPasswordRepository.findByActive(true)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun mot de passe par défaut actif trouvé"));
        return defaultPasswordMapper.toResponse(defaultPassword);
    }

    @Transactional
    public DefaultPasswordResponse createDefaultPassword(DefaultPasswordRequest request) {
        DefaultPassword defaultPassword = defaultPasswordMapper.fromRequest(request);
        defaultPassword = defaultPasswordRepository.save(defaultPassword);
        return defaultPasswordMapper.toResponse(defaultPassword);
    }

    @Transactional
    public DefaultPasswordResponse updateDefaultPassword(Long id, DefaultPasswordRequest request) {
        DefaultPassword existingPassword = defaultPasswordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mot de passe par défaut non trouvé avec l'ID: " + id));
        
        existingPassword.setLibelle(request.getLibelle());
        existingPassword.setValeur(request.getValeur());
        
        existingPassword = defaultPasswordRepository.save(existingPassword);
        return defaultPasswordMapper.toResponse(existingPassword);
    }

    @Transactional
    public void deleteDefaultPassword(Long id) {
        if (!defaultPasswordRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mot de passe par défaut non trouvé avec l'ID: " + id);
        }
        defaultPasswordRepository.deleteById(id);
    }

    @Transactional
    public DefaultPasswordResponse activateDefaultPassword(Long id) {
        DefaultPassword passwordToActivate = defaultPasswordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mot de passe par défaut non trouvé avec l'ID: " + id));
        
        // Deactivate currently active password if any
        defaultPasswordRepository.findByActive(true)
                .ifPresent(activePassword -> {
                    activePassword.setActive(false);
                    defaultPasswordRepository.save(activePassword);
                });
        
        // Activate the requested password
        passwordToActivate.setActive(true);
        passwordToActivate = defaultPasswordRepository.save(passwordToActivate);
        
        return defaultPasswordMapper.toResponse(passwordToActivate);
    }
}
