package com.example.mspaciente.entity;

import com.example.mspaciente.enums.TipoTransacao;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transacoes_pontos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransacaoPontos {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 10)
    private TipoTransacao tipo;
    
    @Column(name = "descricao", nullable = false, length = 100)
    private String descricao;
    
    @Column(name = "valor_reais", precision = 10, scale = 2)
    private BigDecimal valorReais;
    
    @Column(name = "quantidade_pontos", nullable = false)
    private Integer quantidadePontos;
    
    @Column(name = "data_hora", nullable = false)
    @Builder.Default
    private LocalDateTime dataHora = LocalDateTime.now();
}