package com.example.demo.domain.scout.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class ScoutAddRequestDto {
    private Long userIdList[];
    private boolean sendEmail;
    private String emailList[];
    private String emailContent;
}
