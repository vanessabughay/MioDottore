package com.example.mspaciente.controller;

import com.example.mspaciente.dto.*;
import com.example.mspaciente.service.PacienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class PacienteController {
    
    @Autowired
    private PacienteService pacienteService;
    
    @PostMapping("/interno/pacientes")
    public ResponseEntity<?> criarPaciente(@Valid @RequestBody PacienteCadastroDTO cadastroDTO) {
        try {
            PacienteResponseDTO response = pacienteService.criarPaciente(cadastroDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @GetMapping("/{cpf}")
    public ResponseEntity<?> buscarPaciente(@PathVariable String cpf) {
        try {
            PacienteResponseDTO response = pacienteService.buscarPorCpf(cpf);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @GetMapping("/{cpf}/transacoes")
    public ResponseEntity<?> buscarTransacoes(@PathVariable String cpf) {
        try {
            List<TransacaoPontosResponseDTO> response = pacienteService.buscarTransacoesPorCpf(cpf);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @PutMapping("/{cpf}/pontos")
    public ResponseEntity<?> comprarPontos(@PathVariable String cpf, @Valid @RequestBody CompraPontosDTO compraPontosDTO) {
        try {
            PacienteResponseDTO response = pacienteService.comprarPontos(cpf, compraPontosDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @GetMapping("/{cpf}/saldo")
    public ResponseEntity<?> verificarSaldo(@PathVariable String cpf) {
        try {
            SaldoResponseDTO response = pacienteService.verificarSaldo(cpf);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @PutMapping("/{cpf}/pontos/debitar")
    public ResponseEntity<?> debitarPontos(@PathVariable String cpf, @Valid @RequestBody DebitarPontosDTO debitarPontosDTO) {
        try {
            pacienteService.debitarPontos(cpf, debitarPontosDTO.getQuantidade(), debitarPontosDTO.getDescricao());
            return ResponseEntity.ok(Map.of("mensagem", "Pontos debitados com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @PutMapping("/{cpf}/pontos/creditar")
    public ResponseEntity<?> creditarPontos(@PathVariable String cpf, @Valid @RequestBody CreditarPontosDTO creditarPontosDTO) {
        try {
            pacienteService.creditarPontos(cpf, creditarPontosDTO.getQuantidade(), creditarPontosDTO.getDescricao());
            return ResponseEntity.ok(Map.of("mensagem", "Pontos creditados com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "MS Paciente is running!"));
    }
}