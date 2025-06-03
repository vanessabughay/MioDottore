package com.example.mspaciente.dto;

import com.example.mspaciente.enums.TipoTransacao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransacaoPontosResponseDTO {
    
    private Long id;
    private TipoTransacao tipo;
    private String descricao;
    private BigDecimal valorReais;
    private Integer quantidadePontos;
    private LocalDateTime dataHora;
}