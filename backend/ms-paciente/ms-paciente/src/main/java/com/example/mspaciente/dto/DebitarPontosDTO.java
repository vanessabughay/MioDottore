package com.example.mspaciente.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class DebitarPontosDTO {
    
    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 1, message = "Quantidade deve ser maior que zero")
    private Integer quantidade;
    
    private String descricao = "USO EM CONSULTA";

    public DebitarPontosDTO() {}

    public DebitarPontosDTO(Integer quantidade, String descricao) {
        this.quantidade = quantidade;
        this.descricao = descricao != null ? descricao : "USO EM CONSULTA";
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao != null ? descricao : "USO EM CONSULTA";
    }
}