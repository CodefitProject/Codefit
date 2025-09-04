package com.example.demo.global.exception;

public class GeminiException extends BusinessException {
    
    public GeminiException(String message) {
        super(message);
    }
    
    public GeminiException(String message, Throwable cause) {
        super(message, cause);
    }
}