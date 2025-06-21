package com.example.msconsultaagendamento.repository;

import com.example.msconsultaagendamento.entity.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, String> {
    List<Agendamento> findByConsultaCodigo(String consultaCodigo);
    List<Agendamento> findByPacienteCpf(String pacienteCpf);
    Optional<Agendamento> findByCodigoAndPacienteCpf(String codigo, String pacienteCpf);
    
    @Query("SELECT a FROM Agendamento a JOIN a.consulta c WHERE c.dataHora BETWEEN :inicio AND :fim")
    List<Agendamento> findAgendamentosProximas48h(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
    
    @Query("SELECT a FROM Agendamento a JOIN a.consulta c WHERE a.pacienteCpf = :cpf AND c.dataHora BETWEEN :inicio AND :fim")
    List<Agendamento> findByPacienteCpfAndProximas48h(@Param("cpf") String cpf, @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}