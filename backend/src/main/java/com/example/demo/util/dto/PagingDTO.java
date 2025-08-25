package com.example.demo.util.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;

@Getter
@Setter
public class PagingDTO {

    @Min(value = 0)
    private int pageNumber = 0;
    @Min(value = 1)
    @Max(value = 1000)
    private int rowCount = 20;

    public PageRequest toPageRequest() {
        return PageRequest.of(getPageNumber(), getRowCount());
    }
}
