package com.example.msautenticacao.dto;

import com.example.msautenticacao.enums.TipoUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioResponseDTO {
    
    private Long id;
    private String nome;
    private String cpf;
    private String email;
    private TipoUsuario tipoUsuario;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}