package com.example.msautenticacao.service;

import com.example.msautenticacao.dto.*;
import com.example.msautenticacao.entity.Usuario;
import com.example.msautenticacao.enums.TipoUsuario;
import com.example.msautenticacao.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenService jwtTokenService;
    
    private final AuthenticationManager authenticationManager;
    
    private final RestTemplate restTemplate;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtTokenService jwtTokenService, AuthenticationManager authenticationManager, RestTemplate restTemplate) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.authenticationManager = authenticationManager;
        this.restTemplate = restTemplate;
    }
    
    @Value("${ms.paciente.url}")
    private String msPacienteUrl;
    
    @Value("${ms.consulta.url}")
    private String msConsultaUrl;
    
    public Map<String, Object> autocadastroPaciente(UsuarioCadastroDTO cadastroDTO) {
        if (usuarioRepository.existsByCpf(cadastroDTO.getCpf())) {
            throw new RuntimeException("CPF já cadastrado");
        }
        
        if (usuarioRepository.existsByEmail(cadastroDTO.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        
        String senhaGerada = gerarSenhaAleatoria();
        String senhaHash = passwordEncoder.encode(senhaGerada);
        
        Usuario usuario = Usuario.builder()
                .nome(cadastroDTO.getNome())
                .cpf(cadastroDTO.getCpf())
                .email(cadastroDTO.getEmail())
                .senhaHash(senhaHash)
                .tipoUsuario(TipoUsuario.PACIENTE)
                .build();
        
        usuario = usuarioRepository.save(usuario);
        
        Map<String, Object> pacienteData = new HashMap<>();
        pacienteData.put("cpf", cadastroDTO.getCpf());
        pacienteData.put("nome", cadastroDTO.getNome());
        pacienteData.put("email", cadastroDTO.getEmail());
        pacienteData.put("cep", cadastroDTO.getCep());

        try {
            restTemplate.postForObject(msPacienteUrl + "/interno/pacientes", pacienteData, Object.class);
        } catch (Exception e) {
            System.err.println("Erro ao comunicar com MS Paciente: " + e.getMessage());
            throw new RuntimeException("Erro ao cadastrar paciente no serviço de pacientes: " + e.getMessage(), e);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("mensagem", "Paciente cadastrado com sucesso");
        response.put("senhaGerada", senhaGerada);
        response.put("usuario", convertToResponseDTO(usuario));
        
        return response;
    }
    
    public Map<String, Object> cadastrarFuncionario(UsuarioCadastroDTO cadastroDTO, String senhaGerada) {
        if (usuarioRepository.existsByCpf(cadastroDTO.getCpf())) {
            throw new RuntimeException("CPF já cadastrado");
        }
        
        if (usuarioRepository.existsByEmail(cadastroDTO.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        
        String senhaHash = passwordEncoder.encode(senhaGerada);
        
        Usuario usuario = Usuario.builder()
                .nome(cadastroDTO.getNome())
                .cpf(cadastroDTO.getCpf())
                .email(cadastroDTO.getEmail())
                .senhaHash(senhaHash)
                .tipoUsuario(TipoUsuario.FUNCIONARIO)
                .build();
        
        usuario = usuarioRepository.save(usuario);
        
        try {
            Map<String, Object> funcionarioData = new HashMap<>();
            funcionarioData.put("cpf", cadastroDTO.getCpf());
            funcionarioData.put("nome", cadastroDTO.getNome());
            funcionarioData.put("email", cadastroDTO.getEmail());
            funcionarioData.put("telefone", cadastroDTO.getTelefone());
            
            restTemplate.postForObject(msConsultaUrl + "/interno/funcionarios", funcionarioData, Object.class);
        } catch (Exception e) {
            System.err.println("Erro ao comunicar com MS Consulta: " + e.getMessage());
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("mensagem", "Funcionário cadastrado com sucesso");
        response.put("senhaGerada", senhaGerada);
        response.put("usuario", convertToResponseDTO(usuario));
        
        return response;
    }
    
    public Map<String, Object> cadastrarFuncionario(UsuarioCadastroDTO cadastroDTO) {
        return cadastrarFuncionario(cadastroDTO, gerarSenhaAleatoria());
    }

    public List<UsuarioResponseDTO> listarFuncionarios() {
        return usuarioRepository.findByTipoUsuario(TipoUsuario.FUNCIONARIO)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    public TokenDTO login(LoginDTO loginDTO) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getSenha())
            );
            
            Usuario usuario = usuarioRepository.findByEmail(loginDTO.getEmail())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            
            String token = jwtTokenService.generateToken(usuario);
            
            return TokenDTO.builder()
                    .token(token)
                    .tipoUsuario(usuario.getTipoUsuario())
                    .nomeUsuario(usuario.getNome())
                    .cpfUsuario(usuario.getCpf())
                    .build();
                    
        } catch (Exception e) {
            System.err.println("Erro de autenticação: " + e.getMessage());
            e.printStackTrace(); // Imprime o stack trace completo
            throw new RuntimeException("Credenciais inválidas: " + e.getMessage());
        }
    }
    
    private String gerarSenhaAleatoria() {
        SecureRandom random = new SecureRandom();
        int senha = 1000 + random.nextInt(9000);
        return String.valueOf(senha);
    }
    
    private UsuarioResponseDTO convertToResponseDTO(Usuario usuario) {
        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .cpf(usuario.getCpf())
                .email(usuario.getEmail())
                .tipoUsuario(usuario.getTipoUsuario())
                .createdAt(usuario.getCreatedAt())
                .updatedAt(usuario.getUpdatedAt())
                .build();
    }
}
