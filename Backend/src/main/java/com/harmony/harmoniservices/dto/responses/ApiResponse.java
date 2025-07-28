package com.harmony.harmoniservices.dto.responses;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Réponse API standard pour toutes les requêtes")
public class ApiResponse<T> {
    
    @Schema(description = "Indique si la requête a réussi", example = "true")
    private boolean success;
    
    @Schema(description = "Message d'information ou d'erreur", example = "Opération réussie")
    private String message;
    
    @Schema(description = "Données renvoyées par l'API")
    private T data;
    
    /**
     * Crée une réponse de succès avec un message et des données
     * @param <T> Type de données
     * @param message Message de succès
     * @param data Données à renvoyer
     * @return ApiResponse formatée
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }
    
    /**
     * Crée une réponse de succès avec un message sans données
     * @param <T> Type de données
     * @param message Message de succès
     * @return ApiResponse formatée
     */
    public static <T> ApiResponse<T> success(String message) {
        return success(message, null);
    }
    
    /**
     * Crée une réponse d'échec avec un message d'erreur
     * @param <T> Type de données
     * @param message Message d'erreur
     * @return ApiResponse formatée
     */
    public static <T> ApiResponse<T> fail(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
    
    /**
     * Crée une réponse d'échec avec un message d'erreur et des données associées
     * @param <T> Type de données
     * @param message Message d'erreur
     * @param data Données d'erreur
     * @return ApiResponse formatée
     */
    public static <T> ApiResponse<T> fail(String message, T data) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(data)
                .build();
    }
} 