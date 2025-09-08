package com.example.demo.common.email.service;

import com.example.demo.domain.application.dto.CompanyOwnerInfoDto;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String content, String from) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        message.setFrom(from);
        mailSender.send(message);
    }

    public void sendBulkEmailWithCompanyInfo(
            List<String> recipients,
            String content,
            String status,
            CompanyOwnerInfoDto companyOwner
    ) {
        String subject = switch (status.toUpperCase()) {
            case "ACCEPTED", "REJECTED" -> "[" + companyOwner.getName() + "] 지원 결과 안내";
            case "SCOUT"                -> "[" + companyOwner.getName() + "] 스카웃 제안 안내";
            default                     -> "지원 상태 변경 안내";
        };
System.out.println(content);
        String footer = "\n\n문의: " + companyOwner.getName() + " (" + companyOwner.getEmail() + ")";
        String fullContent = content + footer;

        for (String email : recipients) {
            sendEmail(email, subject, fullContent, companyOwner.getEmail());
        }
    }

}
