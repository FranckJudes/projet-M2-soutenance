package com.harmony.harmoniservices.security;

import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // In our case, the username is the email
        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Create authorities from the user role
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(
                userEntity.getRole() != null ? userEntity.getRole() : "USER");

        // Return Spring Security UserDetails object
        return new User(
                userEntity.getEmail(),
                userEntity.getPassword(),
                Collections.singletonList(authority)
        );
    }
}
