package com.example.msconsultaagendamento.dto;

import jakarta.validation.constraints.NotBlank;

public class CheckinRequestDTO {
    
    @NotBlank(message = "CPF do paciente é obrigatório")
    private String pacienteCpf;

    public CheckinRequestDTO() {}

    public CheckinRequestDTO(String pacienteCpf) {
        this.pacienteCpf = pacienteCpf;
    }

    public String getPacienteCpf() {
        return pacienteCpf;
    }

    public void setPacienteCpf(String pacienteCpf) {
        this.pacienteCpf = pacienteCpf;
    }
}