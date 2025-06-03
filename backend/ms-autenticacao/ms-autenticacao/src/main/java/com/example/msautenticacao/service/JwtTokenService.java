package com.example.msautenticacao.service;

import com.example.msautenticacao.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtTokenService {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private Long jwtExpiration;
    
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    public String generateToken(Usuario usuario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("cpf", usuario.getCpf());
        claims.put("tipoUsuario", usuario.getTipoUsuario().toString());
        claims.put("nome", usuario.getNome());
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(usuario.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    public String getEmailFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }
    
    public String getCpfFromToken(String token) {
        return (String) getClaimsFromToken(token).get("cpf");
    }
    
    public String getTipoUsuarioFromToken(String token) {
        return (String) getClaimsFromToken(token).get("tipoUsuario");
    }
    
    public String getNomeFromToken(String token) {
        return (String) getClaimsFromToken(token).get("nome");
    }
    
    public Date getExpirationDateFromToken(String token) {
        return getClaimsFromToken(token).getExpiration();
    }
    
    public Boolean isTokenExpired(String token) {
        Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }
    
    public Boolean validateToken(String token, Usuario usuario) {
        String email = getEmailFromToken(token);
        return (email.equals(usuario.getEmail()) && !isTokenExpired(token));
    }
    
    private Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
