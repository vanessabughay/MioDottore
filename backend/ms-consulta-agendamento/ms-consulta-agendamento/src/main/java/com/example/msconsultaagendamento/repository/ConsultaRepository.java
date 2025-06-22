package com.example.msconsultaagendamento.repository;

import com.example.msconsultaagendamento.entity.Consulta;
import com.example.msconsultaagendamento.enums.StatusConsulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, String> {
    List<Consulta> findByStatusAndVagasDisponiveisGreaterThan(StatusConsulta status, Integer vagas);
    List<Consulta> findByStatus(StatusConsulta status);
    List<Consulta> findByDataHoraBetweenAndStatus(LocalDateTime start, LocalDateTime end, StatusConsulta status);
    List<Consulta> findByEspecialidadeCodigo(String especialidadeCodigo);
}