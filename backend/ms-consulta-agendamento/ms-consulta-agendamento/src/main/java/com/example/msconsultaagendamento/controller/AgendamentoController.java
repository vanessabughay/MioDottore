package com.example.msconsultaagendamento.controller;

import com.example.msconsultaagendamento.dto.*;
import com.example.msconsultaagendamento.service.ConsultaAgendamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/agendamentos")
@CrossOrigin(origins = "*")
public class AgendamentoController {
    
    @Autowired
    private ConsultaAgendamentoService consultaAgendamentoService;
    
    @PostMapping
    public ResponseEntity<?> agendarConsulta(@Valid @RequestBody AgendamentoRequestDTO requestDTO) {
        try {
            AgendamentoResponseDTO response = consultaAgendamentoService.agendarConsulta(requestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @PutMapping("/{codigoAgendamento}/cancelar-paciente")
    public ResponseEntity<?> cancelarAgendamentoPaciente(@PathVariable String codigoAgendamento, @RequestParam String pacienteCpf) {
        try {
            consultaAgendamentoService.cancelarAgendamentoPaciente(codigoAgendamento, pacienteCpf);
            return ResponseEntity.ok(Map.of("mensagem", "Agendamento cancelado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @PutMapping("/{codigoAgendamento}/check-in")
    public ResponseEntity<?> realizarCheckin(@PathVariable String codigoAgendamento, @RequestParam String pacienteCpf) {
        try {
            consultaAgendamentoService.realizarCheckin(codigoAgendamento, pacienteCpf);
            return ResponseEntity.ok(Map.of("mensagem", "Check-in realizado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @PutMapping("/{codigoAgendamento}/confirmar-comparecimento")
    public ResponseEntity<?> confirmarComparecimento(@PathVariable String codigoAgendamento) {
        try {
            consultaAgendamentoService.confirmarComparecimento(codigoAgendamento);
            return ResponseEntity.ok(Map.of("mensagem", "Comparecimento confirmado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
}