package com.example.demo.domain.user.dto;

public record UserRegisterRequestDto(
    String name,
    String birthDate,
    String gender,
    String phoneNumber,
    String email,
    String password,
    String emailConsent
) {}