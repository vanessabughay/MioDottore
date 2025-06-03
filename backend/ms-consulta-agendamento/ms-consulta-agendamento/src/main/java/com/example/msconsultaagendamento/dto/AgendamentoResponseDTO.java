package com.example.msconsultaagendamento.dto;

import com.example.msconsultaagendamento.enums.StatusAgendamento;
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
public class AgendamentoResponseDTO {
    
    private String codigo;
    private ConsultaResponseDTO consulta;
    private String pacienteCpf;
    private String pacienteNome;
    private Integer pontosUsados;
    private BigDecimal valorPago;
    private StatusAgendamento status;
    private LocalDateTime dataHora;
}