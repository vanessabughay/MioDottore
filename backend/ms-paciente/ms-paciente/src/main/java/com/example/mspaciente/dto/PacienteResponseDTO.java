package com.example.mspaciente.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacienteResponseDTO {
    
    private Long id;
    private String cpf;
    private String nome;
    private String email;
    private String cep;
    private String endereco;
    private Integer saldoPontos;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}