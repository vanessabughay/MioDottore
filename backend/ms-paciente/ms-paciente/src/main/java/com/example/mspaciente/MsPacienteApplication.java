package com.example.mspaciente;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.example.mspaciente"})
public class MsPacienteApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsPacienteApplication.class, args);
    }

}
