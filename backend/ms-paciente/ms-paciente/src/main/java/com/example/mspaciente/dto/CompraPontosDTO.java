package com.example.mspaciente.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompraPontosDTO {
    
    @NotNull(message = "Quantidade de pontos é obrigatória")
    @Min(value = 1, message = "Quantidade de pontos deve ser maior que zero")
    private Integer quantidadePontos;
}