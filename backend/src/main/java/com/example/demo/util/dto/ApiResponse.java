package com.example.demo.util.dto;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Getter
public class ApiResponse<T> {
    private final boolean success;
    private final String message;
    private final T data;
    private final int code;

    private ApiResponse(boolean success, String message, T data, int code) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.code = code;
    }

    // 성공 응답 (데이터 있음)
    public static <T> ResponseEntity<ApiResponse<T>> success(T data) {
        return ResponseEntity.ok(new ApiResponse<>(true, "성공", data, HttpStatus.OK.value()));
    }

    // 성공 응답 (메시지만)
    public static <T> ResponseEntity<ApiResponse<T>> success(String message) {
        return ResponseEntity.ok(new ApiResponse<>(true, message, null, HttpStatus.OK.value()));
    }

    // 성공 응답 (데이터 + 메시지)
    public static <T> ResponseEntity<ApiResponse<T>> success(String message, T data) {
        return ResponseEntity.ok(new ApiResponse<>(true, message, data, HttpStatus.OK.value()));
    }

    // 실패 응답 (Bad Request)
    public static <T> ResponseEntity<ApiResponse<T>> badRequest(String message) {
        return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, message, null, HttpStatus.BAD_REQUEST.value()));
    }

    // 실패 응답 (Internal Server Error)
    public static <T> ResponseEntity<ApiResponse<T>> error(String message) {
        return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, message, null, HttpStatus.INTERNAL_SERVER_ERROR.value()));
    }

    // 커스텀 상태 코드
    public static <T> ResponseEntity<ApiResponse<T>> of(HttpStatus status, String message, T data) {
        return ResponseEntity.status(status)
                .body(new ApiResponse<>(status.is2xxSuccessful(), message, data, status.value()));
    }
}