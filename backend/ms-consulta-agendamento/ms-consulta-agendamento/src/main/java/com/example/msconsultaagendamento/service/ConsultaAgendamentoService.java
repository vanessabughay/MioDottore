package com.example.msconsultaagendamento.service;

import com.example.msconsultaagendamento.dto.*;
import com.example.msconsultaagendamento.entity.*;
import com.example.msconsultaagendamento.enums.*;
import com.example.msconsultaagendamento.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ConsultaAgendamentoService {
    
    @Autowired
    private EspecialidadeRepository especialidadeRepository;
    
    @Autowired
    private FuncionarioRepository funcionarioRepository;
    
    @Autowired
    private ConsultaRepository consultaRepository;
    
    @Autowired
    private AgendamentoRepository agendamentoRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${ms.paciente.url}")
    private String msPacienteUrl;
    
    @Transactional
    public void criarFuncionario(FuncionarioDTO funcionarioDTO) {
        if (funcionarioRepository.existsByCpf(funcionarioDTO.getCpf())) {
            throw new RuntimeException("CPF já cadastrado");
        }
        
        Funcionario funcionario = Funcionario.builder()
                .cpf(funcionarioDTO.getCpf())
                .nome(funcionarioDTO.getNome())
                .email(funcionarioDTO.getEmail())
                .telefone(funcionarioDTO.getTelefone())
                .status(StatusFuncionario.ATIVO)
                .build();
        
        funcionarioRepository.save(funcionario);
    }
    
    @Transactional
    public ConsultaResponseDTO cadastrarConsulta(ConsultaCadastroDTO cadastroDTO) {
        System.out.println("=== DEBUG CADASTRO CONSULTA ===");
        System.out.println("CPF recebido: " + cadastroDTO.getMedicoCpf());
        System.out.println("Data/Hora: " + cadastroDTO.getDataHora());
        System.out.println("Valor: " + cadastroDTO.getValor());
        System.out.println("Vagas: " + cadastroDTO.getVagas());
        
        Especialidade especialidade = especialidadeRepository.findById(cadastroDTO.getEspecialidadeCodigo())
                .orElseThrow(() -> new RuntimeException("Especialidade não encontrada"));
        
        Funcionario medico = funcionarioRepository.findByCpf(cadastroDTO.getMedicoCpf())
                .orElseThrow(() -> new RuntimeException("Médico não encontrado"));
        
        System.out.println("Funcionário encontrado: " + medico.getNome() + " - CPF: " + medico.getCpf());
        System.out.println("Gerando código da consulta...");
        
        String codigoConsulta = gerarCodigoConsulta(cadastroDTO.getDataHora());
        System.out.println("Código gerado: " + codigoConsulta);
        
        Consulta consulta = Consulta.builder()
                .codigo(codigoConsulta)
                .dataHora(cadastroDTO.getDataHora())
                .especialidade(especialidade)
                .medicoCpf(cadastroDTO.getMedicoCpf())
                .medicoNome(medico.getNome())
                .valor(cadastroDTO.getValor())
                .vagas(cadastroDTO.getVagas())
                .vagasDisponiveis(cadastroDTO.getVagas())
                .status(StatusConsulta.DISPONIVEL)
                .build();
        
        consulta = consultaRepository.save(consulta);
        return convertToConsultaResponseDTO(consulta);
    }
    
    public void criarFuncionarioPadrao() {
        try {
            System.out.println("Verificando se funcionário padrão existe...");
            boolean existe = funcionarioRepository.existsByCpf("13655909926");
            System.out.println("Funcionário existe: " + existe);
            
            if (!existe) {
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
                System.out.println("Funcionário padrão já existe!");
            }
        } catch (Exception e) {
            System.err.println("ERRO ao criar funcionário padrão: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public List<ConsultaResponseDTO> buscarConsultasDisponiveis(String especialidadeCodigo) {
        List<Consulta> consultas;
        
        if (especialidadeCodigo != null && !especialidadeCodigo.isEmpty()) {
            consultas = consultaRepository.findByEspecialidadeCodigo(especialidadeCodigo)
                    .stream()
                    .filter(c -> c.getStatus() == StatusConsulta.DISPONIVEL)
                    .collect(Collectors.toList());
        } else {
            consultas = consultaRepository.findByStatus(StatusConsulta.DISPONIVEL);
        }
        
        return consultas.stream()
                .map(this::convertToConsultaResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public AgendamentoResponseDTO agendarConsulta(AgendamentoRequestDTO requestDTO) {
        Consulta consulta = consultaRepository.findById(requestDTO.getConsultaCodigo())
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        
        if (consulta.getStatus() != StatusConsulta.DISPONIVEL) {
            throw new RuntimeException("Consulta não está disponível");
        }
        
        if (consulta.getVagasDisponiveis() <= 0) {
            throw new RuntimeException("Não há vagas disponíveis");
        }
        
        Map<String, Object> pacienteData = verificarPaciente(requestDTO.getPacienteCpf());
        String pacienteNome = (String) pacienteData.get("nome");
        
        BigDecimal valorPago = consulta.getValor();
        Integer pontosUsados = 0;
        
        if (requestDTO.getPontosParaUsar() > 0) {
            Map<String, Object> saldoData = verificarSaldoPontos(requestDTO.getPacienteCpf());
            Integer saldoPontos = (Integer) saldoData.get("saldoPontos");
            
            if (saldoPontos < requestDTO.getPontosParaUsar()) {
                throw new RuntimeException("Saldo de pontos insuficiente");
            }
            
            debitarPontos(requestDTO.getPacienteCpf(), requestDTO.getPontosParaUsar(), "USO EM CONSULTA");
            pontosUsados = requestDTO.getPontosParaUsar();
            
            BigDecimal desconto = new BigDecimal(pontosUsados).multiply(new BigDecimal("5.00"));
            valorPago = consulta.getValor().subtract(desconto);
            
            if (valorPago.compareTo(BigDecimal.ZERO) < 0) {
                valorPago = BigDecimal.ZERO;
            }
        }
        
        String codigoAgendamento = gerarCodigoAgendamento(consulta.getDataHora());
        
        Agendamento agendamento = Agendamento.builder()
                .codigo(codigoAgendamento)
                .consulta(consulta)
                .pacienteCpf(requestDTO.getPacienteCpf())
                .pacienteNome(pacienteNome)
                .pontosUsados(pontosUsados)
                .valorPago(valorPago)
                .status(StatusAgendamento.CRIADO)
                .build();
        
        agendamento = agendamentoRepository.save(agendamento);
        
        consulta.setVagasDisponiveis(consulta.getVagasDisponiveis() - 1);
        consultaRepository.save(consulta);
        
        return convertToAgendamentoResponseDTO(agendamento);
    }
    
    @Transactional
    public void cancelarAgendamentoPaciente(String codigoAgendamento, String pacienteCpf) {
        Agendamento agendamento = agendamentoRepository.findByCodigoAndPacienteCpf(codigoAgendamento, pacienteCpf)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));
        
        if (agendamento.getStatus() != StatusAgendamento.CRIADO && agendamento.getStatus() != StatusAgendamento.CHECK_IN) {
            throw new RuntimeException("Agendamento não pode ser cancelado");
        }
        
        agendamento.setStatus(StatusAgendamento.CANCELADO_PACIENTE);
        agendamentoRepository.save(agendamento);
        
        Consulta consulta = agendamento.getConsulta();
        consulta.setVagasDisponiveis(consulta.getVagasDisponiveis() + 1);
        consultaRepository.save(consulta);
        
        if (agendamento.getPontosUsados() > 0) {
            creditarPontos(agendamento.getPacienteCpf(), agendamento.getPontosUsados(), "ESTORNO CANCELAMENTO");
        }
    }
    
    @Transactional
    public void realizarCheckin(String codigoAgendamento, String pacienteCpf) {
        Agendamento agendamento = agendamentoRepository.findByCodigoAndPacienteCpf(codigoAgendamento, pacienteCpf)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));
        
        if (agendamento.getStatus() != StatusAgendamento.CRIADO) {
            throw new RuntimeException("Check-in não pode ser realizado");
        }
        
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime consultaDataHora = agendamento.getConsulta().getDataHora();
        LocalDateTime limite48h = consultaDataHora.minusHours(48);
        
        if (agora.isBefore(limite48h)) {
            throw new RuntimeException("Check-in só pode ser feito até 48h antes da consulta");
        }
        
        agendamento.setStatus(StatusAgendamento.CHECK_IN);
        agendamentoRepository.save(agendamento);
    }
    
    public List<ConsultaResponseDTO> buscarConsultasProximas48h() {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime em48h = agora.plusHours(48);
        
        List<Consulta> consultas = consultaRepository.findByDataHoraBetweenAndStatus(agora, em48h, StatusConsulta.DISPONIVEL);
        
        return consultas.stream()
                .map(this::convertToConsultaResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void confirmarComparecimento(String codigoAgendamento) {
        Agendamento agendamento = agendamentoRepository.findById(codigoAgendamento)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));
        
        if (agendamento.getStatus() != StatusAgendamento.CHECK_IN) {
            throw new RuntimeException("Agendamento deve estar em check-in");
        }
        
        agendamento.setStatus(StatusAgendamento.COMPARECEU);
        agendamentoRepository.save(agendamento);
    }
    
    @Transactional
    public void cancelarConsultaFuncionario(String codigoConsulta) {
        Consulta consulta = consultaRepository.findById(codigoConsulta)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        
        double percentualOcupacao = 1.0 - ((double) consulta.getVagasDisponiveis() / consulta.getVagas());
        
        if (percentualOcupacao >= 0.5) {
            throw new RuntimeException("Não é possível cancelar consulta com 50% ou mais das vagas ocupadas");
        }
        
        consulta.setStatus(StatusConsulta.CANCELADA);
        consultaRepository.save(consulta);
        
        List<Agendamento> agendamentos = agendamentoRepository.findByConsultaCodigo(codigoConsulta);
        
        for (Agendamento agendamento : agendamentos) {
            if (agendamento.getStatus() == StatusAgendamento.CRIADO || agendamento.getStatus() == StatusAgendamento.CHECK_IN) {
                agendamento.setStatus(StatusAgendamento.CANCELADO_SISTEMA);
                agendamentoRepository.save(agendamento);
                
                if (agendamento.getPontosUsados() > 0) {
                    creditarPontos(agendamento.getPacienteCpf(), agendamento.getPontosUsados(), "ESTORNO CANCELAMENTO SISTEMA");
                }
            }
        }
    }
    
    @Transactional
    public void realizarConsulta(String codigoConsulta) {
        Consulta consulta = consultaRepository.findById(codigoConsulta)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        
        consulta.setStatus(StatusConsulta.REALIZADA);
        consultaRepository.save(consulta);
        
        List<Agendamento> agendamentos = agendamentoRepository.findByConsultaCodigo(codigoConsulta);
        
        for (Agendamento agendamento : agendamentos) {
            if (agendamento.getStatus() == StatusAgendamento.CRIADO || agendamento.getStatus() == StatusAgendamento.CHECK_IN) {
                agendamento.setStatus(StatusAgendamento.FALTOU);
            }
            agendamentoRepository.save(agendamento);
        }
    }
    
    private Map<String, Object> verificarPaciente(String cpf) {
        try {
            return restTemplate.getForObject(msPacienteUrl + "/" + cpf, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Paciente não encontrado");
        }
    }
    
    private Map<String, Object> verificarSaldoPontos(String cpf) {
        try {
            return restTemplate.getForObject(msPacienteUrl + "/" + cpf + "/saldo", Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao verificar saldo de pontos");
        }
    }
    
    private void debitarPontos(String cpf, Integer quantidade, String descricao) {
        try {
            Map<String, Object> dados = Map.of("quantidade", quantidade, "descricao", descricao);
            restTemplate.put(msPacienteUrl + "/" + cpf + "/pontos/debitar", dados);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao debitar pontos");
        }
    }
    
    private void creditarPontos(String cpf, Integer quantidade, String descricao) {
        try {
            Map<String, Object> dados = Map.of("quantidade", quantidade, "descricao", descricao);
            restTemplate.put(msPacienteUrl + "/" + cpf + "/pontos/creditar", dados);
        } catch (Exception e) {
            System.err.println("Erro ao creditar pontos: " + e.getMessage());
        }
    }
    
    private String gerarCodigoConsulta(LocalDateTime dataHora) {
        String timestamp = dataHora.format(DateTimeFormatter.ofPattern("MMddHHmm"));
        return "C" + timestamp + (System.currentTimeMillis() % 100);
    }
    
    private String gerarCodigoAgendamento(LocalDateTime dataHora) {
        String timestamp = dataHora.format(DateTimeFormatter.ofPattern("MMddHHmm"));
        return "A" + timestamp + (System.currentTimeMillis() % 100);
    }
    
    private ConsultaResponseDTO convertToConsultaResponseDTO(Consulta consulta) {
        EspecialidadeDTO especialidadeDTO = EspecialidadeDTO.builder()
                .codigo(consulta.getEspecialidade().getCodigo())
                .nome(consulta.getEspecialidade().getNome())
                .build();
        
        return ConsultaResponseDTO.builder()
                .codigo(consulta.getCodigo())
                .dataHora(consulta.getDataHora())
                .especialidade(especialidadeDTO)
                .medicoCpf(consulta.getMedicoCpf())
                .medicoNome(consulta.getMedicoNome())
                .valor(consulta.getValor())
                .vagas(consulta.getVagas())
                .vagasDisponiveis(consulta.getVagasDisponiveis())
                .status(consulta.getStatus())
                .createdAt(consulta.getCreatedAt())
                .build();
    }
    
    private AgendamentoResponseDTO convertToAgendamentoResponseDTO(Agendamento agendamento) {
        return AgendamentoResponseDTO.builder()
                .codigo(agendamento.getCodigo())
                .consulta(convertToConsultaResponseDTO(agendamento.getConsulta()))
                .pacienteCpf(agendamento.getPacienteCpf())
                .pacienteNome(agendamento.getPacienteNome())
                .pontosUsados(agendamento.getPontosUsados())
                .valorPago(agendamento.getValorPago())
                .status(agendamento.getStatus())
                .dataHora(agendamento.getConsulta().getDataHora())
                .build();
    }
    
    public List<AgendamentoResponseDTO> buscarAgendamentosProximas48h() {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime em48h = agora.plusHours(48);
        
        List<Agendamento> agendamentos = agendamentoRepository.findAgendamentosProximas48h(agora, em48h);
        
        return agendamentos.stream()
                .map(this::convertToAgendamentoResponseDTO)
                .collect(Collectors.toList());
    }
    
    public List<AgendamentoResponseDTO> buscarAgendamentosPacienteProximas48h(String cpf) {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime em48h = agora.plusHours(48);
        
        List<Agendamento> agendamentos = agendamentoRepository.findByPacienteCpfAndProximas48h(cpf, agora, em48h);
        return agendamentos.stream()
                .map(this::convertToAgendamentoResponseDTO)
                .collect(Collectors.toList());
    }

    public List<AgendamentoResponseDTO> buscarAgendamentosPaciente(String cpf) {
        List<Agendamento> agendamentos = agendamentoRepository.findByPacienteCpf(cpf);

        
        return agendamentos.stream()
                .map(this::convertToAgendamentoResponseDTO)
                .collect(Collectors.toList());
    }
}