package com.example.msconsultaagendamento.repository;

import com.example.msconsultaagendamento.entity.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    Optional<Funcionario> findByCpf(String cpf);
    boolean existsByCpf(String cpf);
}