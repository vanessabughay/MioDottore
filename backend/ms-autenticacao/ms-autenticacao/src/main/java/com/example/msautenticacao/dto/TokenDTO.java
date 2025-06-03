package com.example.msautenticacao.dto;

import com.example.msautenticacao.enums.TipoUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenDTO {
    
    private String token;
    private TipoUsuario tipoUsuario;
    private String nomeUsuario;
    private String cpfUsuario;
}