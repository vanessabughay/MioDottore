package com.example.msconsultaagendamento.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuncionarioDTO {
    
    @NotBlank
    @Size(min = 11, max = 11)
    private String cpf;
    
    @NotBlank
    @Size(max = 100)
    private String nome;
    
    @NotBlank
    @Email
    @Size(max = 100)
    private String email;
    
    @Size(max = 20)
    private String telefone;
    
    private String senhaTemporaria;
}