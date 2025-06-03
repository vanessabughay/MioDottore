package com.example.msconsultaagendamento.entity;

import com.example.msconsultaagendamento.enums.StatusConsulta;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "consulta")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consulta {

    @Id
    @Column(name = "codigo", length = 20)
    private String codigo;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @ManyToOne
    @JoinColumn(name = "especialidade_codigo")
    private Especialidade especialidade;

    @Column(name = "medico_cpf", nullable = false, length = 11)
    private String medicoCpf;

    @Column(name = "medico_nome", nullable = false, length = 100)
    private String medicoNome;

    @Column(name = "valor", nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "vagas", nullable = false)
    private Integer vagas;

    @Column(name = "vagas_disponiveis", nullable = false)
    private Integer vagasDisponiveis;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private StatusConsulta status = StatusConsulta.DISPONIVEL;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}