package com.example.msautenticacao.config;

import com.example.msautenticacao.dto.UsuarioCadastroDTO;
import com.example.msautenticacao.entity.Usuario;
import com.example.msautenticacao.enums.TipoUsuario;
import com.example.msautenticacao.repository.UsuarioRepository;
import com.example.msautenticacao.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!usuarioRepository.existsByTipoUsuario(TipoUsuario.FUNCIONARIO)) {
            String senhaGerada = gerarSenhaAleatoria();
            UsuarioCadastroDTO funcionarioDTO = new UsuarioCadastroDTO();
            funcionarioDTO.setNome("Funcionario Padrão");
            funcionarioDTO.setCpf("00000000000");
            funcionarioDTO.setEmail("funcionario@miodottore.com");
            funcionarioDTO.setTelefone("00000000000");

            Map<String, Object> response = usuarioService.cadastrarFuncionario(funcionarioDTO, senhaGerada);

            System.out.println("============================================================");
            System.out.println("Nenhum funcionário encontrado. Criando um usuário padrão.");
            System.out.println("Email: " + funcionarioDTO.getEmail());
            System.out.println("Senha: " + senhaGerada);
            System.out.println("============================================================");
        }
    }

    private String gerarSenhaAleatoria() {
        SecureRandom random = new SecureRandom();
        int senha = 1000 + random.nextInt(9000);
        return String.valueOf(senha);
    }
}
