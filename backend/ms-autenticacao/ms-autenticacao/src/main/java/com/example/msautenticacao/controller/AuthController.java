package com.example.msautenticacao.controller;

import com.example.msautenticacao.dto.*;
import com.example.msautenticacao.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) {
        try {
            TokenDTO tokenDTO = usuarioService.login(loginDTO);
            return ResponseEntity.ok(tokenDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @PostMapping("/pacientes/autocadastro")
    public ResponseEntity<?> autocadastroPaciente(@Valid @RequestBody UsuarioCadastroDTO cadastroDTO) {
        try {
            Map<String, Object> response = usuarioService.autocadastroPaciente(cadastroDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @PostMapping("/funcionarios")
    public ResponseEntity<?> cadastrarFuncionario(@Valid @RequestBody UsuarioCadastroDTO cadastroDTO) {
        try {
            Map<String, Object> response = usuarioService.cadastrarFuncionario(cadastroDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/funcionarios")
    public ResponseEntity<List<UsuarioResponseDTO>> listarFuncionarios() {
        List<UsuarioResponseDTO> funcionarios = usuarioService.listarFuncionarios();
        return ResponseEntity.ok(funcionarios);
    }
    
    @GetMapping("/funcionarios/{id}")
    public ResponseEntity<?> buscarFuncionario(@PathVariable Long id) {
        try {
            UsuarioResponseDTO funcionario = usuarioService.buscarFuncionarioPorId(id);
            return ResponseEntity.ok(funcionario);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @PutMapping("/funcionarios/{id}")
    public ResponseEntity<?> atualizarFuncionario(@PathVariable Long id, @Valid @RequestBody UsuarioUpdateDTO updateDTO) {
        try {
            UsuarioResponseDTO funcionario = usuarioService.atualizarFuncionario(id, updateDTO);
            return ResponseEntity.ok(funcionario);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @DeleteMapping("/funcionarios/{id}")
    public ResponseEntity<?> inativarFuncionario(@PathVariable Long id) {
        try {
            usuarioService.inativarFuncionario(id);
            return ResponseEntity.ok(Map.of("mensagem", "Funcionário inativado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", e.getMessage()));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "MS Autenticação is running!"));
    }
}
