package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.DefaultPassword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DefaultPasswordRepository extends JpaRepository<DefaultPassword, Long> {
    
    Optional<DefaultPassword> findByActive(boolean active);
    
    Optional<DefaultPassword> findByLibelle(String libelle);
}
