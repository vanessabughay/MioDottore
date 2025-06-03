package com.example.msconsultaagendamento.repository;

import com.example.msconsultaagendamento.entity.Especialidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EspecialidadeRepository extends JpaRepository<Especialidade, String> {
}