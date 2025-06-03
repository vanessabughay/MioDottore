package com.example.msconsultaagendamento.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgendamentoRequestDTO {
    
    @NotBlank
    private String consultaCodigo;
    
    @NotBlank
    @Size(min = 11, max = 11)
    private String pacienteCpf;
    
    @Min(0)
    @Builder.Default
    private Integer pontosParaUsar = 0;
}