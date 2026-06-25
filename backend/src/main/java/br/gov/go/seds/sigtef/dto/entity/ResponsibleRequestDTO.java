package br.gov.go.seds.sigtef.dto.entity;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ResponsibleRequestDTO {
    private String name;
    private String cpf;
    private String role;
    private String email;
    private String phone;
    private LocalDate startDate;
    private LocalDate endDate;
}
