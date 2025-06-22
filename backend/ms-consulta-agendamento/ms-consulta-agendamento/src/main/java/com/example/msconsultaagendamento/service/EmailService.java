package com.example.msconsultaagendamento.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarSenhaFuncionario(String email, String nome, String senha) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("goncalvesaraujofellipe@gmail.com");
            message.setTo(email);
            message.setSubject("Bem-vindo ao MioDottore - Conta de Funcionário Criada");
            
            String texto = String.format(
                "Olá %s,\n\n" +
                "Sua conta de funcionário foi criada com sucesso no sistema MioDottore!\n\n" +
                "Sua senha de acesso é: %s\n\n" +
                "Por favor, faça login com seu email e esta senha.\n\n" +
                "Atenciosamente,\n" +
                "Equipe MioDottore",
                nome, senha
            );
            
            message.setText(texto);
            
            mailSender.send(message);
            System.out.println("Email de funcionário enviado com sucesso para: " + email);
            
        } catch (Exception e) {
            System.err.println("Erro ao enviar email para funcionário " + email + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}