package com.harmony.harmoniservices.controllers;

import com.harmony.harmoniservices.dto.Requests.AuthRequest;
import com.harmony.harmoniservices.dto.Requests.RefreshTokenRequest;
import com.harmony.harmoniservices.dto.Requests.RegisterRequest;
import com.harmony.harmoniservices.dto.responses.ApiResponse;
import com.harmony.harmoniservices.dto.responses.AuthResponse;
import com.harmony.harmoniservices.models.RefreshToken;
import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.repository.UserRepository;
import com.harmony.harmoniservices.security.JwtUtil;
import com.harmony.harmoniservices.service.RefreshTokenService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private RefreshTokenService refreshTokenService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> createAuthenticationToken(@RequestBody AuthRequest authRequest) throws Exception {
        try {
            // Authenticate user with email and password
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Invalid email or password"));
        }

        // If authentication is successful, load user details and find user
        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getEmail());
        Optional<UserEntity> userOpt = userRepository.findByEmail(authRequest.getEmail());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(ApiResponse.fail("User not found"));
        }
        
        UserEntity user = userOpt.get();
        
        // Generate JWT token
        final String jwt = jwtUtil.generateTokenWithUserId(userDetails.getUsername(), user.getId());
        
        // Create refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        // Create response with all required fields
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshToken.getToken())
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .build();

        // Return token in response using ApiResponse format
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", authResponse));
    }
    
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        String requestRefreshToken = request.getToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtil.generateTokenWithUserId(user.getEmail(), user.getId());
                    
                    AuthResponse authResponse = AuthResponse.builder()
                            .accessToken(token)
                            .refreshToken(requestRefreshToken)
                            .userId(user.getId())
                            .email(user.getEmail())
                            .role(user.getRole())
                            .build();
                            
                    return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authResponse));
                })
                .orElseGet(() -> ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.fail("Refresh token is not in database!")));
    }
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        // Check if email already exists
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Email is already in use!"));
        }

        // Create new user
        UserEntity user = new UserEntity();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setRole(registerRequest.getRole() != null ? registerRequest.getRole() : "USER");
        
        UserEntity savedUser = userRepository.save(user);

        // Generate JWT token
        final String jwt = jwtUtil.generateTokenWithUserId(savedUser.getEmail(), savedUser.getId());
        
        // Create refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getId());

        // Create response
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshToken.getToken())
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();

        return ResponseEntity.ok(ApiResponse.success("User registered successfully", authResponse));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logoutUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            
            try {
                // Extract user ID from token
                Long userId = jwtUtil.extractUserId(jwt);
                
                // Delete refresh token
                refreshTokenService.deleteByUserId(userId);
                
                return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.fail("Invalid JWT token"));
            }
        }
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail("Authorization header is missing or invalid"));
    }
    
    @GetMapping("/verify-token")
    public ResponseEntity<ApiResponse<String>> verifyToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            
            if (jwtUtil.validateToken(jwt)) {
                return ResponseEntity.ok(ApiResponse.success("Token is valid"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.fail("Token is invalid or expired"));
            }
        }
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail("Authorization header is missing or invalid"));
    }

    // @GetMapping("/verify-token")
    // public ResponseEntity<ApiResponse<String>> verifyToken(@RequestHeader("Authorization") String authHeader) {
    //     if (authHeader != null && authHeader.startsWith("Bearer ")) {
    //         String jwt = authHeader.substring(7);
            
    //         if (jwtUtil.validateToken(jwt)) {
    //             return ResponseEntity.ok(ApiResponse.success("Token is valid"));
    //         } else {
    //             return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
    //                     .body(ApiResponse.fail("Token is invalid or expired"));
    //         }
    //     }
        
    //     return ResponseEntity.status(HttpStatus.BAD_REQUEST)
    //             .body(ApiResponse.fail("Authorization header is missing or invalid"));
    // }
}
