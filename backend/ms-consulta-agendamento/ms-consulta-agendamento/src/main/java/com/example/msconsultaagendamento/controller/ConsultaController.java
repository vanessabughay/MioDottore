package com.example.msconsultaagendamento.controller;

import com.example.msconsultaagendamento.dto.*;
import com.example.msconsultaagendamento.service.ConsultaAgendamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class ConsultaController {
    
    @Autowired
    private ConsultaAgendamentoService consultaAgendamentoService;
    
    @PostMapping("/consultas")
    public ResponseEntity<?> cadastrarConsulta(@Valid @RequestBody ConsultaCadastroDTO cadastroDTO) {
        try {
            ConsultaResponseDTO response = consultaAgendamentoService.cadastrarConsulta(cadastroDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @GetMapping("/disponiveis")
    public ResponseEntity<?> buscarConsultasDisponiveis(@RequestParam(required = false) String especialidade) {
        try {
            List<ConsultaResponseDTO> response = consultaAgendamentoService.buscarConsultasDisponiveis(especialidade);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @GetMapping("/proximas48h")
    public ResponseEntity<?> buscarConsultasProximas48h() {
        try {
            List<ConsultaResponseDTO> response = consultaAgendamentoService.buscarConsultasProximas48h();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @DeleteMapping("/consultas/{codigoConsulta}")
    public ResponseEntity<?> cancelarConsultaFuncionario(@PathVariable String codigoConsulta) {
        try {
            consultaAgendamentoService.cancelarConsultaFuncionario(codigoConsulta);
            return ResponseEntity.ok(Map.of("mensagem", "Consulta cancelada com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @PutMapping("/consultas/{codigoConsulta}/status")
    public ResponseEntity<?> realizarConsulta(@PathVariable String codigoConsulta) {
        try {
            consultaAgendamentoService.realizarConsulta(codigoConsulta);
            return ResponseEntity.ok(Map.of("mensagem", "Consulta realizada com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "MS Consulta/Agendamento is running!"));
    }
    
    @PostMapping("/criar-funcionario-padrao")
    public ResponseEntity<?> criarFuncionarioPadrao() {
        try {
            consultaAgendamentoService.criarFuncionarioPadrao();
            return ResponseEntity.ok(Map.of("mensagem", "Funcionário padrão criado!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
}