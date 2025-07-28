package com.harmony.harmoniservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for API success responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiSuccessResponse<T> {
    
    private LocalDateTime timestamp;
    private int status;
    private String message;
    private T data;
    
    /**
     * Create a success response with data
     * 
     * @param <T> the type of data
     * @param data the data to include in the response
     * @param message the success message
     * @param status the HTTP status code
     * @return a new ApiSuccessResponse
     */
    public static <T> ApiSuccessResponse<T> of(T data, String message, int status) {
        return ApiSuccessResponse.<T>builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .message(message)
                .data(data)
                .build();
    }
    
    /**
     * Create a success response without data
     * 
     * @param message the success message
     * @param status the HTTP status code
     * @return a new ApiSuccessResponse with null data
     */
    public static ApiSuccessResponse<Void> of(String message, int status) {
        return ApiSuccessResponse.<Void>builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .message(message)
                .data(null)
                .build();
    }
}
