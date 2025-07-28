package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.RefreshToken;
import com.harmony.harmoniservices.models.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    
    Optional<RefreshToken> findByUser(UserEntity user);
    
    @Modifying
    int deleteByUser(UserEntity user);
}
