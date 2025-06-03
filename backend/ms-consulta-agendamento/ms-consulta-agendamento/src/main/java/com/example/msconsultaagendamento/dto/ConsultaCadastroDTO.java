package com.example.msconsultaagendamento.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultaCadastroDTO {
    
    @NotNull
    private LocalDateTime dataHora;
    
    @NotBlank
    private String especialidadeCodigo;
    
    @NotBlank
    @Size(min = 11, max = 11)
    private String medicoCpf;
    
    @NotNull
    @DecimalMin("0.01")
    private BigDecimal valor;
    
    @NotNull
    @Min(1)
    private Integer vagas;
}