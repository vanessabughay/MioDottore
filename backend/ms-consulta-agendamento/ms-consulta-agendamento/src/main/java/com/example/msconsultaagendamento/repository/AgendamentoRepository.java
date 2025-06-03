package com.example.msconsultaagendamento.repository;

import com.example.msconsultaagendamento.entity.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, String> {
    List<Agendamento> findByConsultaCodigo(String consultaCodigo);
    List<Agendamento> findByPacienteCpf(String pacienteCpf);
    Optional<Agendamento> findByCodigoAndPacienteCpf(String codigo, String pacienteCpf);
}