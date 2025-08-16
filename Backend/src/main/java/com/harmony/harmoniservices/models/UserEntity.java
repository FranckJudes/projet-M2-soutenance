package com.harmony.harmoniservices.models;

import lombok.*;

import com.harmony.harmoniservices.enums.UserStatus;

import jakarta.persistence.*;

import java.time.LocalDateTime;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@ToString
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "users")
public class UserEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(name = "user_seq", sequenceName = "user_sequence", allocationSize = 1)
    private Long id;
    private String firstName;
    private String lastName;
    private String username;

    @Column(unique = true, nullable = false)
    private String email;
    private String phone;

    @Column(nullable = true)
    private String password;

    @Column(nullable = true)
    private String profilePicture;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserStatus status =  UserStatus.ACTIVE;

    @Column(nullable = true)
    private String role;

    @Column(nullable = true)
    private String theme;
    
    @Column(nullable = true)
    private LocalDateTime createdAt;

    @Column(nullable = true)
    private LocalDateTime updatedAt;
}
