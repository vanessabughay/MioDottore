package com.example.msconsultaagendamento.controller;

import com.example.msconsultaagendamento.dto.FuncionarioDTO;
import com.example.msconsultaagendamento.service.ConsultaAgendamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class FuncionarioController {
    
    @Autowired
    private ConsultaAgendamentoService consultaAgendamentoService;
    
    @PostMapping("/interno/funcionarios")
    public ResponseEntity<?> criarFuncionario(@Valid @RequestBody FuncionarioDTO funcionarioDTO) {
        try {
            consultaAgendamentoService.criarFuncionario(funcionarioDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensagem", "Funcionário criado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
}