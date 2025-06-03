package com.example.msconsultaagendamento.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EspecialidadeDTO {
    
    @NotBlank
    @Size(max = 10)
    private String codigo;
    
    @NotBlank
    @Size(max = 50)
    private String nome;
}