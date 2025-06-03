package com.example.msconsultaagendamento.service;

import com.example.msconsultaagendamento.entity.Especialidade;
import com.example.msconsultaagendamento.repository.EspecialidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

@Service
public class DataInitializationService implements CommandLineRunner {
    
    @Autowired
    private EspecialidadeRepository especialidadeRepository;
    
    @Override
    public void run(String... args) throws Exception {
        initializeEspecialidades();
    }
    
    private void initializeEspecialidades() {
        if (especialidadeRepository.count() == 0) {
            especialidadeRepository.save(new Especialidade("CARDIO", "Cardiologia"));
            especialidadeRepository.save(new Especialidade("DERMA", "Dermatologia"));
            especialidadeRepository.save(new Especialidade("NEURO", "Neurologia"));
            especialidadeRepository.save(new Especialidade("ORTHO", "Ortopedia"));
            especialidadeRepository.save(new Especialidade("PEDIA", "Pediatria"));
            especialidadeRepository.save(new Especialidade("GERAL", "Clínica Geral"));
            
            System.out.println("Especialidades inicializadas com sucesso!");
        }
    }
}