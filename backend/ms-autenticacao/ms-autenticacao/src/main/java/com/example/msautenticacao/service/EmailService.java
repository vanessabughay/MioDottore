package com.example.msautenticacao.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarSenhaGerada(String email, String nome, String senha, String tipoUsuario) {
        try {
            System.out.println("=== TENTANDO ENVIAR EMAIL ===");
            System.out.println("Para: " + email);
            System.out.println("Nome: " + nome);
            System.out.println("Tipo: " + tipoUsuario);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("goncalvesaraujofellipe@gmail.com");
            message.setTo(email);
            message.setSubject("Bem-vindo ao MioDottore - Sua senha de acesso");
            
            String texto = String.format(
                "Olá %s,\n\n" +
                "Seu cadastro foi realizado com sucesso no sistema MioDottore!\n\n" +
                "Tipo de usuário: %s\n" +
                "Sua senha de acesso é: %s\n\n" +
                "Por favor, faça login com seu email e esta senha.\n\n" +
                "Atenciosamente,\n" +
                "Equipe MioDottore",
                nome, tipoUsuario, senha
            );
            
            message.setText(texto);
            
            mailSender.send(message);
            System.out.println("Email enviado com sucesso para: " + email);
            
        } catch (Exception e) {
            System.err.println("Erro ao enviar email para " + email + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}