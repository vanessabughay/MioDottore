package com.example.mspaciente.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "pacientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paciente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "cpf", nullable = false, length = 11, unique = true)
    private String cpf;
    
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;
    
    @Column(name = "email", nullable = false, length = 100, unique = true)
    private String email;
    
    @Column(name = "cep", nullable = false, length = 8)
    private String cep;
    
    @Column(name = "endereco", nullable = false, length = 255)
    private String endereco;
    
    @Column(name = "saldo_pontos", nullable = false)
    @Builder.Default
    private Integer saldoPontos = 0;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}