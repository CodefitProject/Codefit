package com.example.demo.global.exception;

/**
 * 비즈니스 로직에서 발생하는 예외
 * 사용자에게 직접 보여줄 수 있는 메시지를 담음
 */
public class BusinessException extends RuntimeException {
    
    public BusinessException(String message) {
        super(message);
    }
    
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}