package com.example.msconsultaagendamento.entity;

import com.example.msconsultaagendamento.enums.StatusAgendamento;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "agendamento")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Agendamento {

    @Id
    @Column(name = "codigo", length = 20)
    private String codigo;

    @ManyToOne
    @JoinColumn(name = "consulta_codigo")
    private Consulta consulta;

    @Column(name = "paciente_cpf", nullable = false, length = 11)
    private String pacienteCpf;

    @Column(name = "paciente_nome", nullable = false, length = 100)
    private String pacienteNome;

    @Column(name = "pontos_usados")
    @Builder.Default
    private Integer pontosUsados = 0;

    @Column(name = "valor_pago", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private StatusAgendamento status = StatusAgendamento.CRIADO;

    @Column(name = "data_hora")
    @Builder.Default
    private LocalDateTime dataHora = LocalDateTime.now();
}