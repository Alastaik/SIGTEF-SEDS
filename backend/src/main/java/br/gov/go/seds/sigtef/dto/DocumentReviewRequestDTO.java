package br.gov.go.seds.sigtef.dto;

import lombok.Data;

@Data
public class DocumentReviewRequestDTO {
    private String status;
    private String comments;
}
