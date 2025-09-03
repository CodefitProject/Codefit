package com.example.demo.common;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * 비동기 처리를 위한 설정 클래스
 * SMTP 이메일 전송 등의 비동기 작업을 위한 설정을 제공합니다.
 * 
 * @author system
 * @since 2025.01
 * @author : 김지훈
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * 이메일 전송용 비동기 처리 Executor
     * 
     * @return ThreadPoolTaskExecutor
     */
    @Bean(name = "emailTaskExecutor")
    public Executor emailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 기본 스레드 수 (항상 유지되는 스레드 수)
        executor.setCorePoolSize(2);
        
        // 최대 스레드 수 (필요에 따라 증가 가능한 최대 스레드 수)
        executor.setMaxPoolSize(10);
        
        // 큐 용량 (대기 중인 작업을 저장할 큐의 크기)
        executor.setQueueCapacity(100);
        
        // 스레드 이름 접두사
        executor.setThreadNamePrefix("email-async-");
        
        // 어플리케이션 종료 시 대기 중인 작업 완료 대기
        executor.setWaitForTasksToCompleteOnShutdown(true);
        
        // 종료 대기 시간 (초)
        executor.setAwaitTerminationSeconds(30);
        
        // 초기화
        executor.initialize();
        
        return executor;
    }
    
    /**
     * 일반적인 비동기 작업용 Executor
     * 
     * @return ThreadPoolTaskExecutor
     */
    @Bean(name = "generalTaskExecutor")
    public Executor generalTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(15);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("general-async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        
        executor.initialize();
        
        return executor;
    }
}