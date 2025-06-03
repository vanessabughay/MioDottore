# Backend MioDottore - Sistema de Gestão Hospitalar

## Visão Geral

Arquitetura e portas:

- **API Gateway** (Node.js/Express) - Porta 4000
- **MS Autenticação** (Spring Boot) - Porta 8081  
- **MS Paciente** (Spring Boot) - Porta 8082
- **MS Consulta/Agendamento** (Spring Boot) - Porta 8083

## Como Subir o Ambiente

### Comando
```bash
cd backend
docker-compose up --build
```

## Serviços e Portas

- **API Gateway**: http://localhost:4000
- **MS Autenticação**: http://localhost:8081  
- **MS Paciente**: http://localhost:8082
- **MS Consulta/Agendamento**: http://localhost:8083

### Bancos de Dados
- **db-auth**: localhost:5431 (PostgreSQL - Autenticação)
- **db-paciente**: localhost:5432 (PostgreSQL - Pacientes)
- **db-consulta**: localhost:5433 (PostgreSQL - Consultas)

## Endpoints da API

> **Nota**: Todas as requisições do frontend devem passar pelo API Gateway (porta 4000). URLs dos microsserviços diretos são apenas para referência interna, não precisa requisitar a eles.

### Rotas de Autenticação (Públicas)

As seguintes rotas não exigem um token JWT para serem acessadas, não vão precisar usar:

-   **Login de Usuário:**
    -   `POST /auth/login`
    -   **Exemplo:** `POST http://localhost:4000/auth/login`
    -   **Corpo da Requisição:** `{ "email": "seu_email", "senha": "sua_senha" }`
    -   **Resposta:** Retorna um `TokenDTO` com o token JWT e informações do usuário em caso de sucesso.

-   **Autocadastro de Paciente:**
    -   `POST /auth/pacientes/autocadastro`
    -   **Exemplo:** `POST http://localhost:4000/auth/pacientes/autocadastro`
    -   **Corpo da Requisição:** `{ "nome": "...", "cpf": "...", "email": "...", "cep": "..." }`
    -   **Resposta:** Retorna uma mensagem de sucesso e a senha gerada para o paciente.

-   **Verificação de Saúde do Gateway:**
    -   `GET /gateway-health`
    -   **Exemplo:** `GET http://localhost:4000/gateway-health`
    -   **Resposta:** `{ "status": "API Gateway rodando!", "port": 4000 }`

-   **Buscar Consultas Disponíveis:**
    -   `GET /consultas/disponiveis?especialidade={codigo}`
    -   **Exemplo:** `GET http://localhost:4000/consultas/disponiveis?especialidade=Cardiologia`
    -   **Autenticação**: ❌ Não requerida
    -   **Parâmetros Query** (opcionais):
        - `especialidade`: Filtrar por código da especialidade (ex: CARDIO, DERMA, etc.)
    -   **Resposta de Sucesso** (200 OK):
        ```json
        [
          {
            "codigo": "CONS-20240116-1000-321",
            "dataHora": "2024-01-16T10:00:00",
            "especialidade": {
              "codigo": "DERMA",
              "nome": "Dermatologia"
            },
            "medicoCpf": "11122233344",
            "medicoNome": "Dra. Ana Costa",
            "valor": 180.00,
            "vagas": 8,
            "vagasDisponiveis": 6,
            "status": "DISPONIVEL",
            "createdAt": "2024-01-12T09:00:00"
          }
        ]
        ```

### Rotas Protegidas (Requerem Token JWT)

Para acessar as rotas protegidas, você vão precisar incluir o token JWT obtido no login no cabeçalho `Authorization` de cada requisição, no formato `Bearer TOKEN_JWT`.

**Exemplo de Cabeçalho:**
`Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...`

#### Rotas do Microsserviço de Autenticação (`ms-autenticacao`)

Todas as outras rotas do `ms-autenticacao` são acessadas através do prefixo `/auth` no gateway e requerem autenticação.

-   **Cadastro de Funcionário:**
    -   `POST /auth/funcionarios`
    -   **Exemplo:** `POST http://localhost:4000/auth/funcionarios`
    -   **Corpo da Requisição:** `{ "nome": "...", "cpf": "...", "email": "...", "telefone": "..." }`
    -   **Requer:** Token JWT de um usuário com `tipoUsuario: "FUNCIONARIO"`. (A validação do tipo de usuário é feita no API Gateway).

-   **Outras rotas do ms-autenticacao (se houver):**
    -   `/[qualquer_rota_do_ms-autenticacao]`
    -   **Exemplo:** `GET http://localhost:4000/auth/minha-rota-protegida`

#### Rotas do Microsserviço de Paciente (`ms-paciente`)

Todas as rotas do `ms-paciente` são acessadas através do prefixo `/pacientes` no gateway e requerem autenticação.

-   **Buscar Paciente por CPF:**
    -   `GET /pacientes/{cpf}`
    -   **Exemplo:** `GET http://localhost:4000/pacientes/12345678901`

-   **Buscar Transações de Pontos:**
    -   `GET /pacientes/{cpf}/transacoes`
    -   **Exemplo:** `GET http://localhost:4000/pacientes/12345678901/transacoes`

-   **Comprar Pontos:**
    -   `POST /pacientes/{cpf}/pontos/comprar`
    -   **Exemplo:** `POST http://localhost:4000/pacientes/12345678901/pontos/comprar`
    -   **Corpo da Requisição:** `{ "quantidadePontos": 50 }`

-   **Verificar Saldo de Pontos:**
    -   `GET /pacientes/{cpf}/saldo`
    -   **Exemplo:** `GET http://localhost:4000/pacientes/12345678901/saldo`

-   **Debitar Pontos:**
    -   `POST /pacientes/{cpf}/pontos/debitar`
    -   **Exemplo:** `POST http://localhost:4000/pacientes/12345678901/pontos/debitar`
    -   **Corpo da Requisição:** `{ "quantidade": 50, "descricao": "USO EM CONSULTA" }`

-   **Creditar Pontos:**
    -   `POST /pacientes/{cpf}/pontos/creditar`
    -   **Exemplo:** `POST http://localhost:4000/pacientes/12345678901/pontos/creditar`
    -   **Corpo da Requisição:** `{ "quantidade": 20, "descricao": "ESTORNO CANCELAMENTO" }`

#### Rotas do Microsserviço de Consulta e Agendamento (`ms-consulta-agendamento`)

As rotas deste microsserviço são acessadas através do prefixo `/consultas` no gateway e requerem autenticação.

-   **Cadastrar Consulta:**
    -   `POST /consultas/consultas`
    -   **Exemplo:** `POST http://localhost:4000/consultas/consultas`
    -   **Corpo da Requisição:** `{ "dataHora": "2024-01-20T14:00:00", "especialidadeCodigo": "CARDIO", "medicoCpf": "98765432100", "valor": 250.00, "vagas": 15 }`
    -   **Requer:** Token JWT.

-   **Buscar Próximas Consultas (Próximas 48h):**
    -   `GET /consultas/proximas48h`
    -   **Exemplo:** `GET http://localhost:4000/consultas/proximas48h`
    -   **Requer:** Token JWT.

-   **Cancelar Consulta por Funcionário:**
    -   `PUT /consultas/consultas/{codigoConsulta}/cancelar-funcionario`
    -   **Exemplo:** `PUT http://localhost:4000/consultas/consultas/ABC123XYZ/cancelar-funcionario`
    -   **Requer:** Token JWT.

-   **Realizar Consulta:**
    -   `PUT /consultas/consultas/{codigoConsulta}/realizar`
    -   **Exemplo:** `PUT http://localhost:4000/consultas/consultas/ABC123XYZ/realizar`
    -   **Requer:** Token JWT.

-   **Agendar Consulta:**
    -   `POST /consultas/agendamentos`
    -   **Exemplo:** `POST http://localhost:4000/consultas/agendamentos`
    -   **Corpo da Requisição:** `{ "consultaCodigo": "...", "pacienteCpf": "...", "pontosParaUsar": "..." }`
    -   **Requer:** Token JWT.

-   **Cancelar Agendamento por Paciente:**
    -   `PUT /consultas/agendamentos/{codigoAgendamento}/cancelar-paciente?pacienteCpf={cpf}`
    -   **Exemplo:** `PUT http://localhost:4000/consultas/agendamentos/AGD123XYZ/cancelar-paciente?pacienteCpf=12345678901`
    -   **Requer:** Token JWT.

-   **Realizar Check-in:**
    -   `PUT /consultas/agendamentos/{codigoAgendamento}/check-in?pacienteCpf={cpf}`
    -   **Exemplo:** `PUT http://localhost:4000/consultas/agendamentos/AGD123XYZ/check-in?pacienteCpf=12345678901`
    -   **Requer:** Token JWT.

-   **Confirmar Comparecimento:**
    -   `PUT /consultas/agendamentos/{codigoAgendamento}/confirmar-comparecimento`
    -   **Exemplo:** `PUT http://localhost:4000/consultas/agendamentos/AGD123XYZ/confirmar-comparecimento`
    -   **Requer:** Token JWT.

### Considerações de Segurança (Rotas Internas)

As rotas com prefixo `/interno` no API Gateway (ex: `/pacientes/interno/**`, `/consultas/interno/**`) não são protegidas por JWT no gateway. Isso ocorre porque elas são destinadas a comunicação **entre microsserviços** (por exemplo, o `ms-autenticacao` chamando o `ms-paciente` para autocadastro, ou o `ms-autenticacao` chamando o `ms-consulta-agendamento` para cadastro de funcionários). O frontend **NÃO** deve tentar acessar essas rotas diretamente.

---

## Especialidades Disponíveis

O sistema possui as seguintes especialidades pré-cadastradas:

- **CARDIO** - Cardiologia
- **DERMA** - Dermatologia  
- **NEURO** - Neurologia
- **ORTHO** - Ortopedia
- **PEDIA** - Pediatria
- **GERAL** - Clínica Geral

---

## Endpoints de Saúde

### API Gateway
**URL**: `http://localhost:4000/gateway-health`

### MS Autenticação  
**URL**: `http://localhost:8081/health`

### MS Paciente
**URL**: `http://localhost:8082/health`

### MS Consulta/Agendamento
**URL**: `http://localhost:8083/health`

---

## Fluxo de Uso Completo

### 1. Cadastro de Paciente
```bash
POST /auth/pacientes/autocadastro
# Retorna senha gerada
```

### 2. Login
```bash
POST /auth/login
# Retorna token JWT para usar nas próximas requisições
```

### 3. Comprar Pontos (Opcional)
```bash
POST /pacientes/{cpf}/pontos/comprar
# Header: Authorization: Bearer {token}
```

### 4. Ver Consultas Disponíveis
```bash
GET /consultas/disponiveis
```

### 5. Agendar Consulta
```bash
POST /consultas/agendamentos
# Header: Authorization: Bearer {token}
```

### 6. Fazer Check-in (Opcional)
```bash
PUT /consultas/agendamentos/{codigo}/check-in?pacienteCpf={cpf}
# Header: Authorization: Bearer {token}
```

### 7. Funcionário Confirma Comparecimento
```bash
PUT /consultas/agendamentos/{codigo}/confirmar-comparecimento
# Header: Authorization: Bearer {token_funcionario}
```

---

## Status e Enums

### Status de Agendamento
- `CRIADO` - Agendamento criado
- `CHECK_IN` - Check-in realizado  
- `COMPARECEU` - Paciente compareceu
- `FALTOU` - Paciente faltou
- `CANCELADO_PACIENTE` - Cancelado pelo paciente
- `CANCELADO_SISTEMA` - Cancelado pelo sistema

### Status de Consulta
- `DISPONIVEL` - Consulta disponível
- `CANCELADA` - Consulta cancelada
- `REALIZADA` - Consulta realizada

### Tipo de Usuário
- `PACIENTE` - Paciente
- `FUNCIONARIO` - Funcionário/médico

### Tipo de Transação de Pontos
- `ENTRADA` - Pontos adicionados
- `SAIDA` - Pontos utilizados

---

## Observações Importantes

1. **Autenticação**: Use o token JWT retornado no login no header `Authorization: Bearer {token}`
2. **Pontos**: 1 ponto = R$ 5,00
3. **Check-in**: Pode ser feito até 48h antes da consulta
4. **Cancelamento de Consulta**: Funcionário só pode cancelar se menos de 50% das vagas estiverem ocupadas
5. **CPF**: Deve ser informado sem pontos ou hífens (apenas números)
6. **CEP**: Deve ter 8 dígitos (sem hífen)

---

