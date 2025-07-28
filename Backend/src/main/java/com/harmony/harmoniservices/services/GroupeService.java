package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.models.GroupeEntity;
import com.harmony.harmoniservices.repository.GroupeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GroupeService {

    private final GroupeRepository groupeRepository;

    @Autowired
    public GroupeService(GroupeRepository groupeRepository) {
        this.groupeRepository = groupeRepository;
    }

    public List<GroupeEntity> findAll() {
        return groupeRepository.findAll();
    }

    public Optional<GroupeEntity> findById(Long id) {
        return groupeRepository.findById(id);
    }

    public GroupeEntity save(GroupeEntity groupe) {
        return groupeRepository.save(groupe);
    }

    public void deleteById(Long id) {
        groupeRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return groupeRepository.existsById(id);
    }

    public GroupeEntity update(GroupeEntity groupe) {
        return groupeRepository.save(groupe);
    }
}
