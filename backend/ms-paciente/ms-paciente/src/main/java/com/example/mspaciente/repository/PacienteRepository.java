package com.example.mspaciente.repository;

import com.example.mspaciente.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    
    Optional<Paciente> findByCpf(String cpf);
    boolean existsByCpf(String cpf);
    boolean existsByEmail(String email);
}