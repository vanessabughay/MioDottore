package com.example.msautenticacao;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.example.msautenticacao"})
public class MsAutenticacaoApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsAutenticacaoApplication.class, args);
    }
}
