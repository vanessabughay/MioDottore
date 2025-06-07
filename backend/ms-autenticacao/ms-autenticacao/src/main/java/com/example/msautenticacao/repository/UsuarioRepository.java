package com.example.msautenticacao.repository;

import com.example.msautenticacao.entity.Usuario;
import com.example.msautenticacao.enums.TipoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByCpf(String cpf);
    boolean existsByEmail(String email);
    boolean existsByCpf(String cpf);
    boolean existsByTipoUsuario(TipoUsuario tipoUsuario);
    List<Usuario> findByTipoUsuario(TipoUsuario tipoUsuario);
}
