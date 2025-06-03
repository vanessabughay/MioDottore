package com.example.msconsultaagendamento.dto;

import com.example.msconsultaagendamento.enums.StatusConsulta;
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
public class ConsultaResponseDTO {
    
    private String codigo;
    private LocalDateTime dataHora;
    private EspecialidadeDTO especialidade;
    private String medicoCpf;
    private String medicoNome;
    private BigDecimal valor;
    private Integer vagas;
    private Integer vagasDisponiveis;
    private StatusConsulta status;
    private LocalDateTime createdAt;
}