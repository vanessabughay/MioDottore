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

## 📋 API Reference - Guia Completo para Frontend

> **⚠️ IMPORTANTE**: Todas as requisições do frontend devem passar pelo **API Gateway (porta 4000)**. 
> 
> **Base URL**: `http://localhost:4000`

---

## 🔓 **ROTAS PÚBLICAS (Sem Autenticação)**

### 1. 🏥 Health Check
```typescript
// GET /gateway-health
fetch('http://localhost:4000/gateway-health')
  .then(response => response.json())
  .then(data => console.log(data));

// Resposta:
{
  "status": "API Gateway rodando!",
  "port": 4000
}
```

### 2. 👤 Autocadastro de Paciente
```typescript
// POST /auth/pacientes/autocadastro
const cadastroData = {
  nome: "João Silva",
  cpf: "12345678901",    // Apenas números
  email: "joao@email.com",
  cep: "01234567"        // 8 dígitos sem hífen
};

fetch('http://localhost:4000/auth/pacientes/autocadastro', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(cadastroData)
})
.then(response => response.json())
.then(data => {
  console.log('Senha gerada:', data.senhaGerada);
  // Salvar a senha para o usuário!
});

// Resposta de Sucesso:
{
  "mensagem": "Paciente cadastrado com sucesso",
  "senhaGerada": "1234"
}
```

### 3. 🔐 Login (Paciente ou Funcionário)
```typescript
// POST /auth/login
const loginData = {
  email: "joao@email.com",
  senha: "1234"  // Senha gerada no autocadastro ou senha do funcionário
};

fetch('http://localhost:4000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginData)
})
.then(response => response.json())
.then(data => {
  // SALVAR O TOKEN JWT!
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('userType', data.tipoUsuario);
  localStorage.setItem('userCpf', data.cpfUsuario);
  localStorage.setItem('userName', data.nomeUsuario);
});

// Resposta de Sucesso:
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tipoUsuario": "PACIENTE", // ou "FUNCIONARIO"
  "nomeUsuario": "João Silva",
  "cpfUsuario": "12345678901"
}
```

### 4. 🔍 Buscar Consultas Disponíveis
```typescript
// GET /consultas/disponiveis
// GET /consultas/disponiveis?especialidade=CARDIO

// Sem filtro
fetch('http://localhost:4000/consultas/disponiveis')
  .then(response => response.json())
  .then(consultas => console.log(consultas));

// Com filtro de especialidade
const especialidade = 'CARDIO'; // CARDIO, DERMA, NEURO, ORTHO, PEDIA, GERAL
fetch(`http://localhost:4000/consultas/disponiveis?especialidade=${especialidade}`)
  .then(response => response.json())
  .then(consultas => console.log(consultas));

// Resposta:
[
  {
    "codigo": "C12071400123",
    "dataHora": "2025-12-07T14:00:00",
    "especialidade": {
      "codigo": "CARDIO",
      "nome": "Cardiologia"
    },
    "medicoCpf": "98765432100",
    "medicoNome": "Dr. Carlos Santos",
    "valor": 250.00,
    "vagas": 10,
    "vagasDisponiveis": 8,
    "status": "DISPONIVEL",
    "createdAt": "2025-06-07T12:00:00"
  }
]
```

---

## 🔒 **ROTAS PROTEGIDAS (Requerem JWT Token)**

> **⚠️ TODAS as requisições abaixo precisam do header:**
> 
> `Authorization: Bearer SEU_JWT_TOKEN`

### 📦 Função para criar headers autenticados:
```typescript
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}
```

---

## 👨‍⚕️ **ROTAS PARA FUNCIONÁRIOS**

### 5. 📋 Listar Funcionários
```typescript
// GET /auth/funcionarios
// APENAS para usuários com tipoUsuario: "FUNCIONARIO"

fetch('http://localhost:4000/auth/funcionarios', {
  headers: getAuthHeaders()
})
.then(response => response.json())
.then(funcionarios => console.log(funcionarios));

// Resposta:
[
  {
    "id": 1,
    "nome": "Dr. Carlos Santos",
    "cpf": "98765432100",
    "email": "carlos@miodottore.com",
    "tipoUsuario": "FUNCIONARIO",
    "createdAt": "2025-06-07T12:00:00"
  }
]
```

### 6. ➕ Cadastrar Funcionário
```typescript
// POST /auth/funcionarios
// APENAS para usuários com tipoUsuario: "FUNCIONARIO"

const funcionarioData = {
  nome: "Dra. Ana Costa",
  cpf: "11122233344",
  email: "ana@miodottore.com",
  telefone: "11999887766"
};

fetch('http://localhost:4000/auth/funcionarios', {
  method: 'POST',
  headers: getAuthHeaders(),
  body: JSON.stringify(funcionarioData)
})
.then(response => response.json())
.then(data => {
  console.log('Funcionário criado, senha:', data.senhaGerada);
});

// Resposta:
{
  "mensagem": "Funcionário cadastrado com sucesso",
  "usuario": { /* dados do funcionário */ },
  "senhaGerada": "5678"
}
```

### 7. 🩺 Cadastrar Nova Consulta
```typescript
// POST /consultas/consultas

const consultaData = {
  dataHora: "2025-12-07T14:00:00",
  especialidadeCodigo: "CARDIO", // CARDIO, DERMA, NEURO, ORTHO, PEDIA, GERAL
  medicoCpf: "98765432100",      // CPF do médico cadastrado
  valor: 250.00,
  vagas: 10
};

fetch('http://localhost:4000/consultas/consultas', {
  method: 'POST',
  headers: getAuthHeaders(),
  body: JSON.stringify(consultaData)
})
.then(response => response.json())
.then(consulta => {
  console.log('Consulta criada com código:', consulta.codigo);
});
```

### 8. 📅 Buscar Consultas Próximas (48h)
```typescript
// GET /consultas/proximas48h

fetch('http://localhost:4000/consultas/proximas48h', {
  headers: getAuthHeaders()
})
.then(response => response.json())
.then(consultas => console.log(consultas));
```

### 9. ❌ Cancelar Consulta (Funcionário)
```typescript
// PUT /consultas/consultas/{codigo}/cancelar-funcionario

const codigoConsulta = 'C12071400123';

fetch(`http://localhost:4000/consultas/consultas/${codigoConsulta}/cancelar-funcionario`, {
  method: 'PUT',
  headers: getAuthHeaders()
})
.then(response => response.json())
.then(data => console.log(data.mensagem));
```

### 10. ✅ Realizar Consulta
```typescript
// PUT /consultas/consultas/{codigo}/realizar

const codigoConsulta = 'C12071400123';

fetch(`http://localhost:4000/consultas/consultas/${codigoConsulta}/realizar`, {
  method: 'PUT',
  headers: getAuthHeaders()
})
.then(response => response.json())
.then(data => console.log(data.mensagem));
```

### 11. ✅ Confirmar Comparecimento
```typescript
// PUT /consultas/agendamentos/{codigo}/confirmar-comparecimento

const codigoAgendamento = 'A12071400123';

fetch(`http://localhost:4000/consultas/agendamentos/${codigoAgendamento}/confirmar-comparecimento`, {
  method: 'PUT',
  headers: getAuthHeaders()
})
.then(response => response.json())
.then(data => console.log(data.mensagem));
```

---

## 👤 **ROTAS PARA PACIENTES**

### 12. 👨‍💼 Buscar Dados do Paciente
```typescript
// GET /pacientes/{cpf}

const cpfPaciente = localStorage.getItem('userCpf');

fetch(`http://localhost:4000/pacientes/${cpfPaciente}`, {
  headers: getAuthHeaders()
})
.then(response => response.json())
.then(paciente => console.log(paciente));

// Resposta:
{
  "id": 1,
  "cpf": "12345678901",
  "nome": "João Silva",
  "email": "joao@email.com",
  "cep": "01234567",
  "endereco": "Rua Exemplo, 123, São Paulo - SP",
  "saldoPontos": 50,
  "createdAt": "2025-06-07T12:00:00"
}
```

### 13. 💰 Verificar Saldo de Pontos
```typescript
// GET /pacientes/{cpf}/saldo

const cpfPaciente = localStorage.getItem('userCpf');

fetch(`http://localhost:4000/pacientes/${cpfPaciente}/saldo`, {
  headers: getAuthHeaders()
})
.then(response => response.json())
.then(saldo => console.log(`Saldo: ${saldo.saldoPontos} pontos`));

// Resposta:
{
  "saldoPontos": 50
}
```

### 14. 🛒 Comprar Pontos
```typescript
// POST /pacientes/{cpf}/pontos/comprar

const cpfPaciente = localStorage.getItem('userCpf');
const compraData = {
  quantidadePontos: 50  // 1 ponto = R$ 5,00
};

fetch(`http://localhost:4000/pacientes/${cpfPaciente}/pontos/comprar`, {
  method: 'POST',
  headers: getAuthHeaders(),
  body: JSON.stringify(compraData)
})
.then(response => response.json())
.then(paciente => {
  console.log('Novo saldo:', paciente.saldoPontos);
});
```

### 15. 📋 Histórico de Transações
```typescript
// GET /pacientes/{cpf}/transacoes

const cpfPaciente = localStorage.getItem('userCpf');

fetch(`http://localhost:4000/pacientes/${cpfPaciente}/transacoes`, {
  headers: getAuthHeaders()
})
.then(response => response.json())
.then(transacoes => console.log(transacoes));

// Resposta:
[
  {
    "id": 1,
    "tipo": "ENTRADA",        // ENTRADA ou SAIDA
    "descricao": "COMPRA DE PONTOS",
    "valorReais": 250,
    "quantidadePontos": 50,
    "dataHora": "2025-06-07T12:00:00"
  }
]
```

### 16. 📅 Agendar Consulta
```typescript
// POST /consultas/agendamentos

const agendamentoData = {
  consultaCodigo: "C12071400123",    // Código obtido da lista de consultas disponíveis
  pacienteCpf: localStorage.getItem('userCpf'),
  pontosParaUsar: 10                 // Opcional: quantos pontos usar (desconto)
};

fetch('http://localhost:4000/consultas/agendamentos', {
  method: 'POST',
  headers: getAuthHeaders(),
  body: JSON.stringify(agendamentoData)
})
.then(response => response.json())
.then(agendamento => {
  console.log('Agendamento criado:', agendamento.codigo);
});

// Resposta:
{
  "codigo": "A12071400123",
  "consultaCodigo": "C12071400123",
  "pacienteCpf": "12345678901",
  "dataHora": "2025-12-07T14:00:00",
  "valorFinal": 200.00,    // Valor após desconto dos pontos
  "pontosUsados": 10,
  "status": "CRIADO",
  "createdAt": "2025-06-07T12:00:00"
}
```

### 17. 🏥 Fazer Check-in
```typescript
// PUT /consultas/agendamentos/{codigo}/check-in?pacienteCpf={cpf}

const codigoAgendamento = 'A12071400123';
const cpfPaciente = localStorage.getItem('userCpf');

fetch(`http://localhost:4000/consultas/agendamentos/${codigoAgendamento}/check-in?pacienteCpf=${cpfPaciente}`, {
  method: 'PUT',
  headers: getAuthHeaders()
})
.then(response => response.json())
.then(data => console.log(data.mensagem));
```

### 18. ❌ Cancelar Agendamento
```typescript
// PUT /consultas/agendamentos/{codigo}/cancelar-paciente?pacienteCpf={cpf}

const codigoAgendamento = 'A12071400123';
const cpfPaciente = localStorage.getItem('userCpf');

fetch(`http://localhost:4000/consultas/agendamentos/${codigoAgendamento}/cancelar-paciente?pacienteCpf=${cpfPaciente}`, {
  method: 'PUT',
  headers: getAuthHeaders()
})
.then(response => response.json())
.then(data => console.log(data.mensagem));
```

---

## 🚫 **TRATAMENTO DE ERROS**

```typescript
async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        throw new Error('Sessão expirada');
      }
      
      if (response.status === 403) {
        throw new Error('Acesso negado');
      }
      
      const errorData = await response.json();
      throw new Error(errorData.erro || 'Erro na requisição');
    }

    return response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}
```

---

## 📊 **CÓDIGOS DE ESPECIALIDADE**

```typescript
const especialidades = {
  CARDIO: 'Cardiologia',
  DERMA: 'Dermatologia',
  NEURO: 'Neurologia',
  ORTHO: 'Ortopedia',
  PEDIA: 'Pediatria',
  GERAL: 'Clínica Geral'
};
```

---

## 🎯 **STATUS DOS AGENDAMENTOS**

```typescript
enum StatusAgendamento {
  CRIADO = 'CRIADO',
  CHECK_IN = 'CHECK_IN',
  COMPARECEU = 'COMPARECEU',
  FALTOU = 'FALTOU',
  CANCELADO_PACIENTE = 'CANCELADO_PACIENTE',
  CANCELADO_SISTEMA = 'CANCELADO_SISTEMA'
}
```

---

## ⚠️ **REGRAS IMPORTANTES**

1. **CPF**: Sempre apenas números (sem pontos/hífens)
2. **CEP**: 8 dígitos sem hífen
3. **Tokens JWT**: Válidos por 24 horas
4. **Pontos**: 1 ponto = R$ 5,00
5. **Check-in**: Permitido até 48h antes da consulta
6. **Cancelamento de consulta**: Funcionário só pode cancelar se menos de 50% das vagas estiverem ocupadas

---

## 🔄 **FLUXO TÍPICO DE USO**

### Para Pacientes:
1. Autocadastro → 2. Login → 3. Ver consultas disponíveis → 4. Comprar pontos (opcional) → 5. Agendar consulta → 6. Check-in → 7. Aguardar confirmação do funcionário

### Para Funcionários:
1. Login → 2. Cadastrar consultas → 3. Ver agendamentos → 4. Confirmar comparecimentos → 5. Cancelar consultas se necessário

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

