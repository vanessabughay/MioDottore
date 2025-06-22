package com.example.msconsultaagendamento.service;

import com.example.msconsultaagendamento.entity.Especialidade;
import com.example.msconsultaagendamento.entity.Funcionario;
import com.example.msconsultaagendamento.enums.StatusFuncionario;
import com.example.msconsultaagendamento.repository.EspecialidadeRepository;
import com.example.msconsultaagendamento.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializationService implements CommandLineRunner {
    
    @Autowired
    private EspecialidadeRepository especialidadeRepository;
    
    @Autowired
    private FuncionarioRepository funcionarioRepository;
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== INICIANDO DATA INITIALIZATION ===");
        initializeEspecialidades();
        System.out.println("=== DATA INITIALIZATION CONCLUÍDO ===");
    }
    
    private void initializeEspecialidades() {
        System.out.println("Verificando especialidades...");
        long count = especialidadeRepository.count();
        System.out.println("Especialidades encontradas: " + count);
        
        if (count == 0) {
            especialidadeRepository.save(new Especialidade("CARDIO", "Cardiologia"));
            especialidadeRepository.save(new Especialidade("DERMA", "Dermatologia"));
            especialidadeRepository.save(new Especialidade("NEURO", "Neurologia"));
            especialidadeRepository.save(new Especialidade("ORTHO", "Ortopedia"));
            especialidadeRepository.save(new Especialidade("PEDIA", "Pediatria"));
            especialidadeRepository.save(new Especialidade("GERAL", "Clínica Geral"));
            
            System.out.println("Especialidades inicializadas com sucesso!");
        } else {
            System.out.println("Especialidades já existem, pulando criação.");
        }
        
        // SEMPRE EXECUTAR CRIAÇÃO DO FUNCIONÁRIO
        System.out.println("Executando criação do funcionário...");
        initializeFuncionarioPadrao();
    }
    
    private void initializeFuncionarioPadrao() {
        try {
            System.out.println("Verificando se funcionário padrão existe...");
            var funcionarioOpt = funcionarioRepository.findByCpf("13655909926");
            
            if (funcionarioOpt.isEmpty()) {
                System.out.println("Criando funcionário padrão...");
                Funcionario funcionarioPadrao = Funcionario.builder()
                        .cpf("13655909926")
                        .nome("Funcionario Padrão")
                        .email("funcionario@miodottore.com")
                        .telefone("00000000000")
                        .status(StatusFuncionario.ATIVO)
                        .build();
                
                funcionarioRepository.save(funcionarioPadrao);
                System.out.println("Funcionário padrão criado com sucesso!");
            } else {
                Funcionario funcionario = funcionarioOpt.get();
                System.out.println("Funcionário padrão já existe - Status atual: " + funcionario.getStatus());
                
                if (funcionario.getStatus() != StatusFuncionario.ATIVO) {
                    System.out.println("Corrigindo status para ATIVO...");
                    funcionario.setStatus(StatusFuncionario.ATIVO);
                    funcionarioRepository.save(funcionario);
                    System.out.println("Status corrigido!");
                }
            }
        } catch (Exception e) {
            System.err.println("ERRO ao criar funcionário padrão: " + e.getMessage());
            e.printStackTrace();
        }
    }
}