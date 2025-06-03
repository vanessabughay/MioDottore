package com.example.mspaciente.service;

import com.example.mspaciente.dto.*;
import com.example.mspaciente.entity.Paciente;
import com.example.mspaciente.entity.TransacaoPontos;
import com.example.mspaciente.enums.TipoTransacao;
import com.example.mspaciente.repository.PacienteRepository;
import com.example.mspaciente.repository.TransacaoPontosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PacienteService {
    
    @Autowired
    private PacienteRepository pacienteRepository;
    
    @Autowired
    private TransacaoPontosRepository transacaoPontosRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    private static final BigDecimal VALOR_POR_PONTO = new BigDecimal("5.00");
    
    @Transactional
    public PacienteResponseDTO criarPaciente(PacienteCadastroDTO cadastroDTO) {
        if (pacienteRepository.existsByCpf(cadastroDTO.getCpf())) {
            throw new RuntimeException("CPF já cadastrado");
        }
        
        if (pacienteRepository.existsByEmail(cadastroDTO.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        
        String enderecoCompleto = buscarEnderecoPorCep(cadastroDTO.getCep());
        
        Paciente paciente = Paciente.builder()
                .cpf(cadastroDTO.getCpf())
                .nome(cadastroDTO.getNome())
                .email(cadastroDTO.getEmail())
                .cep(cadastroDTO.getCep())
                .endereco(enderecoCompleto)
                .saldoPontos(0)
                .build();
        
        paciente = pacienteRepository.save(paciente);
        
        return convertToResponseDTO(paciente);
    }
    
    public PacienteResponseDTO buscarPorCpf(String cpf) {
        Paciente paciente = pacienteRepository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
        
        return convertToResponseDTO(paciente);
    }
    
    public List<TransacaoPontosResponseDTO> buscarTransacoesPorCpf(String cpf) {
        Paciente paciente = pacienteRepository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
        
        List<TransacaoPontos> transacoes = transacaoPontosRepository.findByPacienteOrderByDataHoraDesc(paciente);
        
        return transacoes.stream()
                .map(this::convertToTransacaoResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public PacienteResponseDTO comprarPontos(String cpf, CompraPontosDTO compraPontosDTO) {
        Paciente paciente = pacienteRepository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
        
        BigDecimal valorTotal = VALOR_POR_PONTO.multiply(new BigDecimal(compraPontosDTO.getQuantidadePontos()));
        
        paciente.setSaldoPontos(paciente.getSaldoPontos() + compraPontosDTO.getQuantidadePontos());
        paciente = pacienteRepository.save(paciente);
        
        TransacaoPontos transacao = TransacaoPontos.builder()
                .paciente(paciente)
                .tipo(TipoTransacao.ENTRADA)
                .descricao("COMPRA DE PONTOS")
                .valorReais(valorTotal)
                .quantidadePontos(compraPontosDTO.getQuantidadePontos())
                .build();
        
        transacaoPontosRepository.save(transacao);
        
        return convertToResponseDTO(paciente);
    }
    
    public SaldoResponseDTO verificarSaldo(String cpf) {
        Paciente paciente = pacienteRepository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
        
        return SaldoResponseDTO.builder()
                .saldoPontos(paciente.getSaldoPontos())
                .build();
    }
    
    @Transactional
    public void debitarPontos(String cpf, Integer quantidade, String descricao) {
        Paciente paciente = pacienteRepository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
        
        if (paciente.getSaldoPontos() < quantidade) {
            throw new RuntimeException("Saldo insuficiente");
        }
        
        paciente.setSaldoPontos(paciente.getSaldoPontos() - quantidade);
        pacienteRepository.save(paciente);
        
        TransacaoPontos transacao = TransacaoPontos.builder()
                .paciente(paciente)
                .tipo(TipoTransacao.SAIDA)
                .descricao(descricao)
                .quantidadePontos(quantidade)
                .build();
        
        transacaoPontosRepository.save(transacao);
    }
    
    @Transactional
    public void creditarPontos(String cpf, Integer quantidade, String descricao) {
        Paciente paciente = pacienteRepository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
        
        paciente.setSaldoPontos(paciente.getSaldoPontos() + quantidade);
        pacienteRepository.save(paciente);
        
        TransacaoPontos transacao = TransacaoPontos.builder()
                .paciente(paciente)
                .tipo(TipoTransacao.ENTRADA)
                .descricao(descricao)
                .quantidadePontos(quantidade)
                .build();
        
        transacaoPontosRepository.save(transacao);
    }
    
    private String buscarEnderecoPorCep(String cep) {
        try {
            String url = "https://viacep.com.br/ws/" + cep + "/json/";
            ViaCepDTO viaCepDTO = restTemplate.getForObject(url, ViaCepDTO.class);
            
            if (viaCepDTO == null || Boolean.TRUE.equals(viaCepDTO.getErro())) {
                throw new RuntimeException("CEP não encontrado");
            }
            
            return String.format("%s, %s, %s - %s", 
                    viaCepDTO.getLogradouro(), 
                    viaCepDTO.getBairro(), 
                    viaCepDTO.getLocalidade(), 
                    viaCepDTO.getUf());
                    
        } catch (Exception e) {
            throw new RuntimeException("Erro ao buscar CEP: " + e.getMessage());
        }
    }
    
    private PacienteResponseDTO convertToResponseDTO(Paciente paciente) {
        return PacienteResponseDTO.builder()
                .id(paciente.getId())
                .cpf(paciente.getCpf())
                .nome(paciente.getNome())
                .email(paciente.getEmail())
                .cep(paciente.getCep())
                .endereco(paciente.getEndereco())
                .saldoPontos(paciente.getSaldoPontos())
                .createdAt(paciente.getCreatedAt())
                .updatedAt(paciente.getUpdatedAt())
                .build();
    }
    
    private TransacaoPontosResponseDTO convertToTransacaoResponseDTO(TransacaoPontos transacao) {
        return TransacaoPontosResponseDTO.builder()
                .id(transacao.getId())
                .tipo(transacao.getTipo())
                .descricao(transacao.getDescricao())
                .valorReais(transacao.getValorReais())
                .quantidadePontos(transacao.getQuantidadePontos())
                .dataHora(transacao.getDataHora())
                .build();
    }
}