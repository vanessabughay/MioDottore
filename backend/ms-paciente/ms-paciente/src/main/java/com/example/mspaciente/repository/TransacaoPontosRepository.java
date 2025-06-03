package com.example.mspaciente.repository;

import com.example.mspaciente.entity.TransacaoPontos;
import com.example.mspaciente.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransacaoPontosRepository extends JpaRepository<TransacaoPontos, Long> {
    
    List<TransacaoPontos> findByPacienteOrderByDataHoraDesc(Paciente paciente);
}