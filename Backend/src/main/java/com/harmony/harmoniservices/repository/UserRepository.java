package com.harmony.harmoniservices.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.harmony.harmoniservices.models.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findByUsername(String username);
}