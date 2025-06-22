# Documentação Técnica Completa do Backend MioDottore

## Visão Geral

O backend do MioDottore é um sistema distribuído de gestão de saúde construído usando arquitetura de microsserviços. Consiste em 3 microsserviços Spring Boot, 3 bancos de dados PostgreSQL e um API Gateway Node.js, todos orquestrados através de containers Docker.

## Mapa Completo de Dependências e Arquivos

### Estrutura de Arquivos por Microsserviço

#### MS-Autenticacao (Porta 8081)
**Arquivos Java Principais:**
- `MsAutenticacaoApplication.java:17` - Classe principal Spring Boot
- `config/SecurityConfig.java:56-58` - Configuração Spring Security, permite rotas públicas
- `config/DataInitializer.java` - Inicialização de dados padrão
- `service/JwtTokenService.java:20-24` - Geração/validação JWT com secret compartilhado
- `service/UsuarioService.java:32,46-50` - Lógica de negócio, chama MS-Paciente:8082 e MS-Consulta:8083
- `service/CustomUserDetailsService.java` - Integração Spring Security
- `controller/AuthController.java:18` - Endpoints REST, injeta UsuarioService
- `entity/Usuario.java` - Entidade JPA com validações
- `enums/TipoUsuario.java` - PACIENTE/FUNCIONARIO
- `repository/UsuarioRepository.java` - Acesso dados PostgreSQL

**Configurações:**
- `application.properties:5-7` - Conexão `db-auth:5432/auth_db`
- `application.properties:14-15` - JWT secret `${JWT_SECRET}` e expiração 24h

#### MS-Paciente (Porta 8082)
**Arquivos Java Principais:**
- `MsPacienteApplication.java` - Classe principal Spring Boot
- `config/SecurityConfig.java:31` - **SEM validação JWT** - permite todas requisições
- `service/PacienteService.java:30,150` - Sistema pontos (R$5/ponto), integra ViaCEP
- `controller/PacienteController.java` - Endpoints REST pacientes/pontos
- `entity/Paciente.java` - Entidade principal com saldo_pontos
- `entity/TransacaoPontos.java` - Histórico transações pontos
- `enums/TipoTransacao.java` - ENTRADA/SAIDA
- `repository/PacienteRepository.java` - Acesso dados PostgreSQL
- `repository/TransacaoPontosRepository.java` - Transações pontos

**Configurações:**
- `application.properties:5-7` - Conexão `db-paciente:5432/patient_db`

#### MS-Consulta-Agendamento (Porta 8083)
**Arquivos Java Principais:**
- `MsConsultaAgendamentoApplication.java` - Classe principal Spring Boot
- `config/SecurityConfig.java:31` - **SEM validação JWT** - permite todas requisições
- `service/ConsultaAgendamentoService.java:38-39,273-303` - Lógica complexa, chama MS-Paciente para pontos
- `service/DataInitializationService.java` - Inicialização especialidades
- `controller/ConsultaController.java` - Endpoints gestão consultas
- `controller/AgendamentoController.java` - Endpoints gestão agendamentos
- `controller/FuncionarioController.java` - Endpoints internos funcionários
- `entity/Consulta.java` - Consultas médicas disponíveis
- `entity/Agendamento.java` - Agendamentos individuais
- `entity/Especialidade.java` - Especialidades médicas
- `entity/Funcionario.java` - Dados funcionários/médicos
- `enums/StatusAgendamento.java` - CRIADO/CHECK_IN/COMPARECEU/CANCELADO
- `enums/StatusConsulta.java` - DISPONIVEL/REALIZADA/CANCELADA
- `enums/StatusFuncionario.java` - Status funcionários

**Configurações:**
- `application.properties:5-7` - Conexão `db-consulta:5432/appointment_db`
- `application.properties:14` - URL MS-Paciente `http://ms-paciente:8082`

#### API Gateway (Porta 4000 - Node.js)
**Arquivo Principal:**
- `index.js` - Express.js com middleware JWT manual

**Middlewares JWT:**
- `authenticateJWT:19-35` - Valida JWT usando mesmo secret dos microsserviços
- `authenticateFuncionario:37-43` - Controle acesso baseado em papel

**Configurações:**
- `index.js:14-17` - URLs microsserviços via variáveis ambiente
- `index.js:17` - JWT_SECRET compartilhado (base64 decoded)
- `package.json` - Dependências: express, jsonwebtoken, node-fetch, cors

## Mapa Detalhado de Comunicação Entre Serviços

### MS-Autenticacao → MS-Paciente
**Arquivo:** `UsuarioService.java:81`
- **Método:** `autocadastroPaciente()`
- **Endpoint:** `POST http://ms-paciente:8082/interno/pacientes`
- **Dados:** cpf, nome, email, cep
- **Linha Config:** `UsuarioService.java:46-47` - URL configurada
- **Uso:** Criação paciente durante autocadastro

### MS-Autenticacao → MS-Consulta-Agendamento
**Arquivo:** `UsuarioService.java:124`
- **Método:** `cadastrarFuncionario()`
- **Endpoint:** `POST http://ms-consulta-agendamento:8083/interno/funcionarios`
- **Dados:** cpf, nome, email, telefone
- **Linha Config:** `UsuarioService.java:49-50` - URL configurada
- **Uso:** Criação funcionário durante cadastro

### MS-Consulta-Agendamento → MS-Paciente (Múltiplas Chamadas)
**Arquivo:** `ConsultaAgendamentoService.java`

1. **Verificação Paciente:**
   - **Linha:** 273
   - **Método:** `verificarPaciente()`
   - **Endpoint:** `GET http://ms-paciente:8082/{cpf}`
   - **Uso:** Validar existência paciente antes agendamento

2. **Verificação Saldo:**
   - **Linha:** 281
   - **Método:** `verificarSaldoPontos()`
   - **Endpoint:** `GET http://ms-paciente:8082/{cpf}/saldo`
   - **Uso:** Verificar pontos suficientes

3. **Débito Pontos:**
   - **Linha:** 290
   - **Método:** `debitarPontos()`
   - **Endpoint:** `PUT http://ms-paciente:8082/{cpf}/pontos/debitar`
   - **Dados:** quantidade, descricao
   - **Uso:** Debitar pontos no agendamento

4. **Crédito Pontos:**
   - **Linha:** 299
   - **Método:** `creditarPontos()`
   - **Endpoint:** `PUT http://ms-paciente:8082/{cpf}/pontos/creditar`
   - **Dados:** quantidade, descricao
   - **Uso:** Reembolso no cancelamento

### MS-Paciente → ViaCEP (API Externa)
**Arquivo:** `PacienteService.java:150`
- **Endpoint:** `GET https://viacep.com.br/ws/{cep}/json/`
- **Uso:** Busca automática endereço por CEP

### Roteamento Detalhado do API Gateway

**Configuração URLs (index.js:14-17):**
```javascript
MS_AUTENTICACAO_URL = http://localhost:8081 (dev) / variável ambiente
MS_PACIENTE_URL = http://localhost:8082 (dev) / variável ambiente  
MS_CONSULTA_URL = http://localhost:8083 (dev) / variável ambiente
```

**Rotas Públicas (SEM JWT):**
- `POST /auth/login` → MS-Autenticacao:8081 (linha 47)
- `POST /auth/pacientes/autocadastro` → MS-Autenticacao:8081 (linha 89)
- `GET /consultas/disponiveis` → MS-Consulta:8083 (linha 702)

**Rotas Protegidas (COM JWT - authenticateJWT):**

*Gestão Pacientes → MS-Paciente:8082*
- `GET /pacientes/{cpf}` (linha 442)
- `GET /pacientes/{cpf}/transacoes` (linha 484)
- `GET /pacientes/{cpf}/saldo` (linha 526)
- `PUT /pacientes/{cpf}/pontos` (linha 568)
- `PUT /pacientes/{cpf}/pontos/debitar` (linha 614)
- `PUT /pacientes/{cpf}/pontos/creditar` (linha 658)

*Gestão Agendamentos → MS-Consulta:8083*
- `POST /agendamentos` (linha 802)
- `DELETE /agendamentos/{codigo}` (linha 847)
- `PUT /agendamentos/{codigo}/status` (linha 890)
- `PUT /agendamentos/{codigo}/comparecimento` (linha 935)
- `GET /agendamentos/proximas48h` (linha 979)
- `GET /agendamentos/paciente/{cpf}` (linha 1021)
- `GET /agendamentos/paciente/{cpf}/proximas48h` (linha 1063)

*Gestão Consultas → MS-Consulta:8083*
- `POST /consultas` (linha 1106)
- `DELETE /consultas/{codigo}` (linha 1151)
- `PUT /consultas/{codigo}/status` (linha 1194)
- `GET /consultas/proximas48h` (linha 1238)

**Rotas Restritas FUNCIONARIOS (JWT + authenticateFuncionario):**
- `GET /auth/funcionarios` → MS-Autenticacao:8081 (linha 119)
- `POST /auth/funcionarios` → MS-Autenticacao:8081 (linha 161)
- `GET /auth/funcionarios/{id}` → MS-Autenticacao:8081 (linha 206)
- `PUT /auth/funcionarios/{id}` → MS-Autenticacao:8081 (linha 248)
- `DELETE /auth/funcionarios/{id}` → MS-Autenticacao:8081 (linha 292)

**Middleware JWT (index.js:19-35):**
```javascript
authenticateJWT() {
  // Extrai token do header Authorization: Bearer <token>
  // Valida usando mesmo JWT_SECRET dos microsserviços
  // Adiciona req.user com dados decodificados do token
}
```

**Controle de Acesso (index.js:37-43):**
```javascript
authenticateFuncionario() {
  // Verifica se req.user.tipoUsuario === 'FUNCIONARIO'
  // Permite acesso apenas para funcionários
}
```

**Tratamento de Erros:**
- **503 Service Unavailable:** ECONNREFUSED - microsserviço fora do ar (linhas 80-82, 153-155)
- **502 Bad Gateway:** Outros erros comunicação (linhas 83, 156)
- **403 Forbidden:** Token JWT inválido (linha 27)
- **401 Unauthorized:** Token JWT ausente (linha 33)

## Arquitetura do Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Frontend      │    │   API Gateway    │    │   Microsserviços    │
│   (Angular)     │────│   (Node.js)      │────│   (Spring Boot)     │
│   Porta: 4200   │    │   Porta: 4000    │    │   Portas: 8081-8083 │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                │
                                │
                       ┌────────▼────────┐
                       │   PostgreSQL    │
                       │   Bancos de     │
                       │   Dados         │
                       │ Portas: 5431-5433│
                       └─────────────────┘
```

## Fluxo de Autenticação JWT

### Fluxo Completo de Autenticação

```
┌─────────────┐  1. Login Request   ┌───────────────┐  2. Forward to MS  ┌─────────────────┐
│  Frontend   │────────────────────▶│  API Gateway  │───────────────────▶│ ms-autenticacao │
│  (Angular)  │                     │   (Node.js)   │                    │  (Spring Boot)  │
└─────────────┘                     └───────────────┘                    └─────────────────┘
       ▲                                     ▲                                      │
       │ 5. JWT Token                        │ 4. JWT Token                         │ 3. Generate JWT
From Backend  │                    From Microservice │                              │    + User Info
       │                                     │                                      ▼
       │                                     │                            ┌─────────────────┐
       │                                     │                            │   PostgreSQL    │
       │                                     │                            │    (auth_db)    │
       │                                     │                            └─────────────────┘
       │
┌─────────────┐  6. Subsequent Requests with Authorization Header
│  Frontend   │  Authorization: Bearer <JWT_TOKEN>
│             │────────────────────────────────────────────┐
└─────────────┘                                            │
                                                           ▼
┌───────────────┐  7. Validate JWT                 ┌─────────────────┐  8. Forward Request
│  API Gateway  │  Decode token and extract        │                 │  (if JWT is valid)
│               │  user information               │  Middleware     │─────────────────────┐
│ Middleware    │  Check expiration               │  authenticateJWT│                     │
│ Functions:    │  Verify signature               │                 │                     ▼
│ - authenticateJWT                              └─────────────────┘           ┌─────────────────┐
│ - authenticateFuncionario                                                     │ Target          │
└───────────────┘                                                             │ Microservice    │
                                                                               │ (ms-paciente or │
                                                                               │ ms-consulta)    │
                                                                               └─────────────────┘
```

### Detalhamento do Processo JWT

#### 1. Processo de Login
```javascript
// Frontend envia credenciais
POST /auth/login
Body: { email: "user@email.com", senha: "password" }
```

#### 2. API Gateway Processa Login
```javascript
// No API Gateway (index.js linha 46-86)
app.post('/auth/login', async (req, res) => {
    const targetUrl = `${MS_AUTENTICACAO_URL}/login`;
    // Faz proxy manual para o microsserviço de autenticação
    const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
    });
    // Retorna a resposta do microsserviço diretamente
});
```

#### 3. Microsserviço de Autenticação Gera JWT
```java
// No ms-autenticacao (AuthController.java)
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
    // 1. Autentica usuário com email/senha
    // 2. Gera token JWT com informações do usuário
    String token = jwtTokenService.generateToken(usuario);
    
    // 3. Retorna token e dados do usuário
    return ResponseEntity.ok(new TokenDTO(
        token, 
        usuario.getTipoUsuario().toString(),
        usuario.getNome(),
        usuario.getCpf()
    ));
}
```

#### 4. Estrutura do Token JWT Gerado
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "usuario@email.com",
    "cpf": "12345678901",
    "tipoUsuario": "PACIENTE",
    "nome": "Nome do Usuário",
    "iat": 1640995200,
    "exp": 1641081600
  },
  "signature": "base64UrlEncode(HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), JWT_SECRET))"
}
```

#### 5. Frontend Armazena e Usa o Token
```typescript
// Frontend armazena o token (geralmente em localStorage)
localStorage.setItem('token', response.token);

// Frontend inclui token em todas as requisições subsequentes
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

#### 6. Validação de Token no API Gateway
```javascript
// API Gateway - Middleware de autenticação (index.js linha 19-35)
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Extrai o token após "Bearer "
        
        // Verifica e decodifica o token
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ erro: 'Token inválido' });
            }
            req.user = user; // Adiciona informações do usuário na requisição
            next(); // Permite prosseguir para o próximo middleware
        });
    } else {
        res.status(401).json({ erro: 'Token de autorização requerido' });
    }
};
```

#### 7. Controle de Acesso Baseado em Função
```javascript
// Middleware específico para funcionários (index.js linha 37-43)
const authenticateFuncionario = (req, res, next) => {
    if (req.user && req.user.tipoUsuario === 'FUNCIONARIO') {
        next(); // Permite acesso
    } else {
        res.status(403).json({ erro: 'Acesso restrito a funcionários' });
    }
};
```

### Tipos de Rotas no Gateway

#### Rotas Públicas (sem autenticação)
- `POST /auth/login` - Login de usuários
- `POST /auth/pacientes/autocadastro` - Autocadastro de pacientes
- `GET /consultas/disponiveis` - Consultas disponíveis para agendamento

#### Rotas Autenticadas (requer JWT válido)
- `GET /pacientes/{cpf}` - Dados do paciente
- `POST /agendamentos` - Criar agendamento
- `GET /agendamentos/paciente/{cpf}` - Agendamentos do paciente

#### Rotas Restritas a Funcionários
- `GET /auth/funcionarios` - Listar funcionários
- `POST /auth/funcionarios` - Criar funcionário
- `PUT /auth/funcionarios/{id}` - Atualizar funcionário
- `DELETE /auth/funcionarios/{id}` - Desativar funcionário

## Arquitetura de Microsserviços

### 1. API Gateway (Node.js - Porta 4000)

**Stack Tecnológico:**
- Node.js com Express.js
- Middleware de autenticação JWT
- Configuração CORS
- Proxy HTTP para roteamento de microsserviços

**Responsabilidades Principais:**
- Rotear requisições para microsserviços apropriados
- Validação de token JWT para endpoints protegidos
- Tratamento CORS para integração com frontend
- Transformação de requisições/respostas
- Tratamento de erros e descoberta de serviços

**Configuração de Roteamento:**
- `/auth/*` → ms-autenticacao (Porta 8081)
- `/pacientes/*` → ms-paciente (Porta 8082)  
- `/consultas/*` → ms-consulta-agendamento (Porta 8083)
- `/agendamentos/*` → ms-consulta-agendamento (Porta 8083)

**Funcionalidades Principais:**
- Implementação de proxy manual usando node-fetch
- Rotas exclusivas para funcionários com controle de acesso baseado em função
- Rotas públicas para autenticação e cadastro de pacientes
- Endpoints de verificação de saúde para monitoramento
- Tratamento de erros com verificação de disponibilidade de serviços

### 2. Microsserviço de Autenticação (ms-autenticacao - Porta 8081)

**Stack Tecnológico:**
- Spring Boot 3.2.5 com Java 17
- Spring Security para autenticação
- Spring Data JPA com PostgreSQL
- Geração e validação de tokens JWT
- Codificação de senha BCrypt

**Esquema do Banco de Dados:**
```sql
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL, -- PACIENTE, FUNCIONARIO
    telefone VARCHAR(15),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Endpoints da API REST:**

**Autenticação:**
- `POST /login` - Autenticação de usuários com geração de token JWT
- `POST /pacientes/autocadastro` - Autocadastro de pacientes

**Gestão de Funcionários:**
- `GET /funcionarios` - Listar todos os funcionários ativos
- `POST /funcionarios` - Criar novo funcionário
- `GET /funcionarios/{id}` - Obter funcionário por ID
- `PUT /funcionarios/{id}` - Atualizar informações do funcionário
- `DELETE /funcionarios/{id}` - Desativar funcionário (exclusão lógica)

**Lógica de Negócio Principal:**
- Senhas de 4 dígitos geradas automaticamente para novos usuários
- Hash de senhas usando BCrypt
- Token JWT com expiração de 24 horas
- Integração com ms-paciente para sincronização de dados de pacientes
- Integração com ms-consulta-agendamento para sincronização de dados de funcionários
- Criação de usuário administrador padrão na inicialização

### 3. Microsserviço de Pacientes (ms-paciente - Porta 8082)

**Stack Tecnológico:**
- Spring Boot 3.2.5 com Java 17
- Spring Data JPA com PostgreSQL
- Integração com API externa (ViaCEP)
- Implementação de sistema de pontos de fidelidade

**Esquema do Banco de Dados:**
```sql
CREATE TABLE pacientes (
    id BIGSERIAL PRIMARY KEY,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    cep VARCHAR(8) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    saldo_pontos INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE transacoes_pontos (
    id BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL REFERENCES pacientes(id),
    tipo VARCHAR(10) NOT NULL, -- ENTRADA or SAIDA
    descricao VARCHAR(100) NOT NULL,
    valor_reais DECIMAL(10,2),
    quantidade_pontos INTEGER NOT NULL,
    data_hora TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Endpoints da API REST:**

**Gestão de Pacientes:**
- `POST /interno/pacientes` - Criar novo paciente (interno)
- `GET /{cpf}` - Obter paciente por CPF
- `GET /{cpf}/saldo` - Obter saldo de pontos do paciente
- `GET /{cpf}/transacoes` - Obter histórico de transações do paciente

**Sistema de Pontos:**
- `PUT /{cpf}/pontos` - Comprar pontos (R$ 5,00 por ponto)
- `PUT /{cpf}/pontos/debitar` - Debitar pontos para consultas
- `PUT /{cpf}/pontos/creditar` - Creditar pontos para reembolsos

**Sistema de Pontos de Fidelidade:**
- Valor do ponto: R$ 5,00 por ponto
- Tipos de transação: ENTRADA (crédito), SAIDA (débito)
- Trilha de auditoria completa para todos os movimentos de pontos
- Validação de saldo para débitos
- Integração com sistema de agendamento de consultas

**Integração com API Externa:**
- API ViaCEP para busca automática de endereço por CEP
- Tratamento de erros para CEPs inválidos
- Validação e formatação de endereços

### 4. Microsserviço de Consultas/Agendamentos (ms-consulta-agendamento - Porta 8083)

**Stack Tecnológico:**
- Spring Boot 3.2.5 com Java 17
- Spring Data JPA com PostgreSQL
- Lógica de negócio complexa para agendamento de saúde
- Sistema de gerenciamento de status

**Esquema do Banco de Dados:**
```sql
CREATE TABLE especialidade (
    codigo VARCHAR(10) PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

CREATE TABLE funcionario (
    id BIGSERIAL PRIMARY KEY,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE consulta (
    codigo VARCHAR(20) PRIMARY KEY,
    data_hora TIMESTAMP NOT NULL,
    especialidade_codigo VARCHAR(10) NOT NULL,
    medico_cpf VARCHAR(11) NOT NULL,
    medico_nome VARCHAR(100) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    vagas INTEGER NOT NULL,
    vagas_disponiveis INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (especialidade_codigo) REFERENCES especialidade(codigo)
);

CREATE TABLE agendamento (
    codigo VARCHAR(20) PRIMARY KEY,
    consulta_codigo VARCHAR(20) NOT NULL,
    paciente_cpf VARCHAR(11) NOT NULL,
    paciente_nome VARCHAR(100) NOT NULL,
    pontos_usados INTEGER NOT NULL DEFAULT 0,
    valor_pago DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    data_hora TIMESTAMP NOT NULL,
    FOREIGN KEY (consulta_codigo) REFERENCES consulta(codigo)
);
```

**Sistema de Gerenciamento de Status:**

**Fluxo de Status do Agendamento:**
- CRIADO → CHECK_IN → COMPARECEU
- CRIADO → CANCELADO_PACIENTE
- CRIADO → CANCELADO_SISTEMA
- CRIADO → FALTOU

**Status da Consulta:**
- DISPONIVEL → REALIZADA
- DISPONIVEL → CANCELADA

**Endpoints da API REST:**

**Gestão de Agendamentos:**
- `POST /agendamentos` - Agendar consulta com integração de pontos
- `DELETE /agendamentos/{codigo}` - Cancelar agendamento com lógica de reembolso
- `PUT /agendamentos/{codigo}/status` - Check-in (regra de 48 horas)
- `PUT /agendamentos/{codigo}/comparecimento` - Confirmar comparecimento
- `GET /agendamentos/proximas48h` - Obter agendamentos nas próximas 48h
- `GET /agendamentos/paciente/{cpf}` - Obter agendamentos do paciente
- `GET /agendamentos/paciente/{cpf}/proximas48h` - Agendamentos do paciente em 48h

**Gestão de Consultas:**
- `POST /consultas` - Criar vagas de consulta
- `GET /disponiveis` - Obter consultas disponíveis com filtros
- `GET /proximas48h` - Obter consultas nas próximas 48h
- `DELETE /consultas/{codigo}` - Cancelar consulta (apenas funcionários)
- `PUT /consultas/{codigo}/status` - Marcar consulta como realizada

**Lógica de Negócio Principal:**
- Janela de check-in de 48 horas para agendamentos
- Gestão automática de vagas (diminui no agendamento, restaura no cancelamento)
- Integração de pontos com cálculo automático de pagamento
- Cancelamento em cascata (consulta → todos os agendamentos relacionados)
- Geração de códigos únicos para consultas e agendamentos

**Especialidades Médicas Padrão:**
- CARDIO - Cardiologia
- DERMA - Dermatologia
- NEURO - Neurologia
- ORTHO - Ortopedia
- PEDIA - Pediatria
- GERAL - Clínica Geral

## Infraestrutura de Banco de Dados

### Containers PostgreSQL

**Três bancos de dados isolados:**

1. **auth_db (Porta 5431)**
   - Container: miodottore-db-auth
   - Usuário: admin_auth/pass_auth
   - Tabelas: usuarios

2. **patient_db (Porta 5432)**
   - Container: miodottore-db-paciente
   - Usuário: admin_paciente/pass_paciente
   - Tabelas: pacientes, transacoes_pontos

3. **appointment_db (Porta 5433)**
   - Container: miodottore-db-consulta
   - Usuário: admin_consulta/pass_consulta
   - Tabelas: especialidade, funcionario, consulta, agendamento

**Funcionalidades do Banco de Dados:**
- Volumes persistentes para retenção de dados
- Criação e atualização automática de esquemas
- Suporte a transações para consistência de dados
- Restrições de unicidade e relacionamentos de chave estrangeira
- Timestamps para trilhas de auditoria

## Orquestração Docker

### Rede de Containers
- **Rede**: miodottore-network (driver bridge)
- **Descoberta de Serviços**: Containers se comunicam pelo nome do serviço
- **Mapeamento de Portas**: Portas externas mapeadas para portas internas padrão

### Dependências de Serviços
```yaml
api-gateway depends_on:
  - ms-autenticacao
  - ms-paciente
  - ms-consulta-agendamento

ms-autenticacao depends_on:
  - db-auth

ms-paciente depends_on:
  - db-paciente

ms-consulta-agendamento depends_on:
  - db-consulta
```

### Variáveis de Ambiente
- JWT_SECRET: Compartilhado entre gateway e serviço de autenticação
- Strings de conexão do banco de dados com descoberta de serviços
- Configurações de porta para comunicação entre serviços

## Comunicação Entre Serviços

### Comunicação da Malha de Serviços

**Serviço de Autenticação → Serviço de Pacientes:**
- Criação de paciente durante autocadastro
- Endpoint: `POST /interno/pacientes`

**Serviço de Autenticação → Serviço de Consultas:**
- Criação de funcionário durante cadastro
- Endpoint: `POST /interno/funcionarios`

**Serviço de Consultas → Serviço de Pacientes:**
- Validação de paciente: `GET /{cpf}`
- Verificação de saldo de pontos: `GET /{cpf}/saldo`
- Débito de pontos: `PUT /{cpf}/pontos/debitar`
- Crédito de pontos: `PUT /{cpf}/pontos/creditar`

### Lógica de Roteamento do API Gateway

**Fluxo de Requisição:**
1. Frontend envia requisição para API Gateway (Porta 4000)
2. Gateway valida token JWT (se necessário)
3. Gateway roteia requisição para microsserviço apropriado
4. Microsserviço processa requisição e consulta banco de dados
5. Resposta flui de volta através do gateway para o frontend

**Tratamento de Erros:**
- Serviço indisponível (503) quando microsserviço está fora do ar
- Bad Gateway (502) para erros de comunicação
- Erros de autenticação (401/403) para tokens inválidos
- Erros de validação (400) para requisições malformadas

## Implantação e Operações

### Sequência de Inicialização
1. **Containers de banco** iniciam primeiro (instâncias PostgreSQL)
2. **Microsserviços** iniciam com dependências de banco
3. **API Gateway** inicia por último, dependendo de todos os microsserviços
4. **Verificações de saúde** verificam se todos os serviços estão operacionais

### Monitoramento de Saúde
- Cada microsserviço expõe endpoint `/health`
- Verificação de saúde do API Gateway em `/gateway-health`
- Script de inicialização valida se todos os serviços estão respondendo
- Log de status de serviços para debugging

### Gerenciamento de Configuração
- Configuração baseada em ambiente
- Credenciais de banco de dados externalizadas
- Gerenciamento de segredo JWT
- Configuração de URL de serviços para diferentes ambientes

## Arquitetura de Segurança

### Autenticação e Autorização
- Autenticação stateless baseada em JWT
- Expiração de token de 24 horas
- Controle de acesso baseado em função (PACIENTE/FUNCIONARIO)
- Hash de senhas com BCrypt
- Configuração CORS para integração com aplicação web

### Considerações de Segurança
- Todos os endpoints atualmente públicos (configuração de desenvolvimento)
- Terminação HTTPS deve ser tratada por proxy reverso
- Credenciais de banco devem ser externalizadas em produção
- Rate limiting e proteção DDoS necessários
- Log de auditoria para eventos de segurança

## Fluxo de Lógica de Negócio

### Fluxo de Cadastro de Paciente
1. Paciente submete formulário de cadastro
2. Serviço de autenticação valida dados
3. Serviço de autenticação chama ViaCEP para endereço
4. Serviço de autenticação cria conta de usuário
5. Serviço de autenticação chama serviço de pacientes para criar registro de paciente
6. Senha gerada automaticamente retornada ao paciente

### Fluxo de Agendamento de Consulta
1. Paciente visualiza consultas disponíveis
2. Paciente seleciona consulta e escolhe método de pagamento
3. Sistema valida paciente e saldo de pontos
4. Sistema cria agendamento e debita pontos
5. Sistema atualiza vagas disponíveis da consulta
6. Confirmação enviada ao paciente

### Fluxo de Check-in
1. Paciente tenta fazer check-in dentro de 48 horas da consulta
2. Sistema valida janela de tempo e status do agendamento
3. Status atualizado de CRIADO para CHECK_IN
4. Paciente pronto para consulta

### Fluxo de Cancelamento
1. Paciente ou funcionário inicia cancelamento
2. Sistema verifica regras de cancelamento
3. Pontos reembolsados se aplicável
4. Vagas de consulta restauradas
5. Status atualizado para cancelado

## Implementação JWT Detalhada

### Arquivos Responsáveis pelo JWT

#### MS-Autenticacao - Geração de Tokens
**JwtTokenService.java (linhas principais):**
- **Linha 20-24:** Configuração secret e expiração via application.properties
- **Linha 26-29:** Método getSigningKey() - decodifica secret base64
- **Linha 31-44:** generateToken() - cria JWT com claims customizados
- **Linha 46-74:** Métodos extração dados do token (email, cpf, tipo, nome)
- **Linha 76-82:** getClaimsFromToken() - parsing e validação token

**Configuração (application.properties):**
```properties
jwt.secret=${JWT_SECRET}     # Linha 14 - Secret compartilhado
jwt.expiration=86400000      # Linha 15 - 24 horas em ms
```

**Claims JWT Customizados (JwtTokenService.java:33-35):**
```java
claims.put("cpf", usuario.getCpf());
claims.put("tipoUsuario", usuario.getTipoUsuario().toString());
claims.put("nome", usuario.getNome());
```

#### API Gateway - Validação de Tokens
**index.js - Middleware JWT:**
- **Linha 17:** Decodifica JWT_SECRET de base64 para string
- **Linha 19-35:** authenticateJWT() - valida token usando jsonwebtoken
- **Linha 23:** Extrai token do header "Authorization: Bearer <token>"
- **Linha 25:** jwt.verify() usando mesmo secret dos microsserviços
- **Linha 29:** Adiciona dados usuário decodificados em req.user

### Fluxo Completo JWT

1. **Geração (MS-Autenticacao):**
   - AuthController.java:89-102 recebe login
   - UsuarioService autentica credenciais
   - JwtTokenService.generateToken() cria token
   - Retorna TokenDTO com token + dados usuário

2. **Validação (API Gateway):**
   - Todas rotas protegidas passam por authenticateJWT()
   - Verifica assinatura usando mesmo JWT_SECRET
   - Extrai claims e adiciona em req.user
   - Middleware authenticateFuncionario() verifica papel

3. **Propagação:**
   - MS-Paciente e MS-Consulta **NÃO validam JWT**
   - Confiam no API Gateway para filtragem
   - SecurityConfig.java permite todas requisições (linha 31)

### Configuração Compartilhada JWT
**docker-compose.yml:**
- **Linha 61:** JWT_SECRET para api-gateway
- **Linha 112:** JWT_SECRET para ms-autenticacao
- **Mesmo valor** garantir compatibilidade tokens

## Dependências de Arquivos Java

### MS-Autenticacao - Dependências Internas
```
MsAutenticacaoApplication.java
└── Não tem dependências internas

SecurityConfig.java
├── @Configuration, @EnableWebSecurity (Spring)
└── SecurityFilterChain, HttpSecurity (Spring Security)

JwtTokenService.java
├── Usuario.java (entity)
├── @Value (Spring) para configurações
└── io.jsonwebtoken.* (JWT library)

UsuarioService.java
├── UsuarioRepository.java (repository)
├── JwtTokenService.java (service)
├── AuthenticationManager (Spring Security)
├── PasswordEncoder (Spring Security)
├── RestTemplate (Spring Web)
└── DTOs: LoginDTO, TokenDTO, UsuarioCadastroDTO, etc.

AuthController.java
├── UsuarioService.java (@Autowired)
└── DTOs: LoginDTO, TokenDTO, UsuarioCadastroDTO

Usuario.java (Entity)
├── TipoUsuario.java (enum)
├── @Entity, @Table (JPA)
└── Validation annotations

UsuarioRepository.java
├── Usuario.java (entity)
└── JpaRepository<Usuario, Long>
```

### MS-Paciente - Dependências Internas
```
PacienteService.java
├── PacienteRepository.java (repository)
├── TransacaoPontosRepository.java (repository)
├── RestTemplate (Spring Web)
├── Paciente.java, TransacaoPontos.java (entities)
├── TipoTransacao.java (enum)
└── DTOs: PacienteCadastroDTO, CompraPontosDTO, etc.

PacienteController.java
├── PacienteService.java (@Autowired)
└── DTOs: PacienteResponseDTO, SaldoResponseDTO, etc.

Paciente.java (Entity)
├── @Entity, @Table (JPA)
├── TransacaoPontos.java (One-to-Many relationship)
└── Validation annotations

TransacaoPontos.java (Entity)
├── @Entity, @Table (JPA)
├── Paciente.java (@ManyToOne)
├── TipoTransacao.java (enum)
└── Validation annotations
```

### MS-Consulta-Agendamento - Dependências Internas
```
ConsultaAgendamentoService.java
├── ConsultaRepository.java (repository)
├── AgendamentoRepository.java (repository)
├── EspecialidadeRepository.java (repository)
├── FuncionarioRepository.java (repository)
├── RestTemplate (Spring Web)
├── Todas entities: Consulta, Agendamento, Especialidade, Funcionario
├── Todos enums: StatusConsulta, StatusAgendamento, StatusFuncionario
└── DTOs: ConsultaCadastroDTO, AgendamentoRequestDTO, etc.

ConsultaController.java
├── ConsultaAgendamentoService.java (@Autowired)
└── DTOs relacionados a consultas

AgendamentoController.java
├── ConsultaAgendamentoService.java (@Autowired)
└── DTOs relacionados a agendamentos

Consulta.java (Entity)
├── @Entity, @Table (JPA)
├── Especialidade.java (@ManyToOne)
├── Agendamento.java (One-to-Many)
└── StatusConsulta.java (enum)

Agendamento.java (Entity)
├── @Entity, @Table (JPA)
├── Consulta.java (@ManyToOne)
└── StatusAgendamento.java (enum)
```

## Configurações de Banco de Dados por Arquivo

### MS-Autenticacao
**application.properties:5-7**
```properties
spring.datasource.url=jdbc:postgresql://db-auth:5432/auth_db
spring.datasource.username=admin_auth
spring.datasource.password=pass_auth
```
**Tabelas:** usuarios
**Container:** miodottore-db-auth (porta 5431)

### MS-Paciente  
**application.properties:5-7**
```properties
spring.datasource.url=jdbc:postgresql://db-paciente:5432/patient_db
spring.datasource.username=admin_paciente
spring.datasource.password=pass_paciente
```
**Tabelas:** pacientes, transacao_pontos
**Container:** miodottore-db-paciente (porta 5432)

### MS-Consulta-Agendamento
**application.properties:5-7**
```properties
spring.datasource.url=jdbc:postgresql://db-consulta:5432/appointment_db
spring.datasource.username=admin_consulta
spring.datasource.password=pass_consulta
```
**Tabelas:** especialidades, funcionarios, consultas, agendamentos
**Container:** miodottore-db-consulta (porta 5433)

## Pontos Críticos de Segurança

### Validação JWT por Serviço
1. **API Gateway (index.js:19-35):** ✅ VALIDA JWT
2. **MS-Autenticacao:** ✅ GERA JWT (JwtTokenService.java)
3. **MS-Paciente (SecurityConfig.java:31):** ❌ NÃO VALIDA - permite tudo
4. **MS-Consulta (SecurityConfig.java:31):** ❌ NÃO VALIDA - permite tudo

### Arquitetura de Confiança
- **API Gateway:** Única barreira de segurança
- **Microsserviços:** Confiam no Gateway (sem validação própria)
- **Risco:** Acesso direto aos microsserviços bypassa autenticação

### Secret JWT Compartilhado
- **Fonte:** Variável ambiente JWT_SECRET
- **Base64 Encoded:** No API Gateway (linha 17)
- **Usado por:** MS-Autenticacao (geração) + API Gateway (validação)

## Conclusão Técnica

Esta arquitetura implementa um padrão de microsserviços com **API Gateway centralizado** responsável por:
- Roteamento de requisições
- Autenticação/autorização JWT
- Controle de acesso baseado em papéis

Os **microsserviços Spring Boot** focam exclusivamente na lógica de negócio, confiando no Gateway para segurança. A comunicação inter-serviços usa **HTTP síncrono** com RestTemplate, mantendo acoplamento baixo através de endpoints REST bem definidos.

**Dependências críticas identificadas:**
1. JWT_SECRET compartilhado entre Gateway e MS-Autenticacao
2. URLs de comunicação inter-serviços via variáveis ambiente
3. Bancos PostgreSQL isolados por domínio de negócio
4. Sistema de pontos integrando MS-Consulta e MS-Paciente

A arquitetura demonstra separação clara de responsabilidades, com cada microsserviço gerenciando seu próprio domínio de dados e lógica de negócio específica.