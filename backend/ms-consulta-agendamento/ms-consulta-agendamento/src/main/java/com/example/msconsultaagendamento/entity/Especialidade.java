package com.example.msconsultaagendamento.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "especialidade")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Especialidade {

    @Id
    @Column(name = "codigo", length = 10)
    private String codigo;

    @Column(name = "nome", nullable = false, length = 50)
    private String nome;
}