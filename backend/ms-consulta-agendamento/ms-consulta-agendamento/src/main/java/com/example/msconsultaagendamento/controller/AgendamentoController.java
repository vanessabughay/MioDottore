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
    
    @DeleteMapping("/{codigoAgendamento}")
    public ResponseEntity<?> cancelarAgendamentoPaciente(@PathVariable String codigoAgendamento, @RequestParam String pacienteCpf) {
        try {
            consultaAgendamentoService.cancelarAgendamentoPaciente(codigoAgendamento, pacienteCpf);
            return ResponseEntity.ok(Map.of("mensagem", "Agendamento cancelado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @PutMapping("/{codigoAgendamento}/status")
    public ResponseEntity<?> realizarCheckin(@PathVariable String codigoAgendamento, @Valid @RequestBody CheckinRequestDTO checkinRequest) {
        try {
            consultaAgendamentoService.realizarCheckin(codigoAgendamento, checkinRequest.getPacienteCpf());
            return ResponseEntity.ok(Map.of("mensagem", "Check-in realizado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @PutMapping("/{codigoAgendamento}/comparecimento")
    public ResponseEntity<?> confirmarComparecimento(@PathVariable String codigoAgendamento) {
        try {
            consultaAgendamentoService.confirmarComparecimento(codigoAgendamento);
            return ResponseEntity.ok(Map.of("mensagem", "Comparecimento confirmado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @GetMapping("/proximas48h")
    public ResponseEntity<?> buscarAgendamentosProximas48h() {
        try {
            List<AgendamentoResponseDTO> response = consultaAgendamentoService.buscarAgendamentosProximas48h();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @GetMapping("/paciente/{cpf}")
    public ResponseEntity<?> buscarAgendamentosPaciente(@PathVariable String cpf) {
        try {
            List<AgendamentoResponseDTO> response = consultaAgendamentoService.buscarAgendamentosPacienteProximas48h(cpf);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @GetMapping("/paciente/{cpf}/proximas48h")
    public ResponseEntity<?> buscarAgendamentosPacienteProximas48h(@PathVariable String cpf) {
        try {
            List<AgendamentoResponseDTO> response = consultaAgendamentoService.buscarAgendamentosPacienteProximas48h(cpf);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
}