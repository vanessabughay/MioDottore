require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); 

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: /localhost:\d+/ }));
app.use(express.json());

const MS_AUTENTICACAO_URL = process.env.MS_AUTENTICACAO_URL || 'http://localhost:8081';
const MS_PACIENTE_URL = process.env.MS_PACIENTE_URL || 'http://localhost:8082';
const MS_CONSULTA_URL = process.env.MS_CONSULTA_URL || 'http://localhost:8083'; 
const JWT_SECRET = Buffer.from(process.env.JWT_SECRET, 'base64').toString('utf8');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ erro: 'Token inválido' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ erro: 'Token de autorização requerido' });
    }
};

const authenticateFuncionario = (req, res, next) => {
    if (req.user && req.user.tipoUsuario === 'FUNCIONARIO') {
        next();
    } else {
        res.status(403).json({ erro: 'Acesso restrito a funcionários' });
    }
};

// Rotas públicas de autenticação
app.post('/auth/login', async (req, res) => {
    const targetUrl = `${MS_AUTENTICACAO_URL}/login`;
    console.log(`[API Gateway] Recebendo POST ${req.originalUrl} -> Proxy manual para ${targetUrl}`);
    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...Object.fromEntries(Object.entries(req.headers).filter(([key]) => !['host', 'content-length'].includes(key.toLowerCase()))),
                host: new URL(targetUrl).host 
            },
            body: JSON.stringify(req.body),
        });

        const responseBody = await response.text(); 
        
        // Encaminhar os cabeçalhos da resposta do microsserviço
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);

        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }

    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.post('/auth/pacientes/autocadastro', async (req, res) => {
    const targetUrl = `${MS_AUTENTICACAO_URL}/pacientes/autocadastro`;

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...req.headers,
                host: new URL(targetUrl).host
            },
            body: JSON.stringify(req.body),
        });

        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });
        
        res.status(response.status).set(responseHeaders).send(await response.buffer());

    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para /auth/pacientes/autocadastro: ${targetUrl}`, error);
        res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
    }
});


// Rotas específicas para funcionários (GET e POST)
app.get('/auth/funcionarios', authenticateJWT, authenticateFuncionario, async (req, res) => {
    const targetUrl = `${MS_AUTENTICACAO_URL}/funcionarios`;
    console.log(`[API Gateway] Rota GET ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            }
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.post('/auth/funcionarios', authenticateJWT, authenticateFuncionario, async (req, res) => {
    const targetUrl = `${MS_AUTENTICACAO_URL}/funcionarios`;
    console.log(`[API Gateway] Rota POST ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                ...headers,
                'content-type': 'application/json',
                host: new URL(targetUrl).host
            },
            body: JSON.stringify(req.body)
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

// Rotas para funcionários por ID (GET, PUT, DELETE)
app.get('/auth/funcionarios/:id', authenticateJWT, authenticateFuncionario, async (req, res) => {
    const targetUrl = `${MS_AUTENTICACAO_URL}/funcionarios/${req.params.id}`;
    console.log(`[API Gateway] Rota GET ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            }
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.put('/auth/funcionarios/:id', authenticateJWT, authenticateFuncionario, async (req, res) => {
    const targetUrl = `${MS_AUTENTICACAO_URL}/funcionarios/${req.params.id}`;
    console.log(`[API Gateway] Rota PUT ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'PUT',
            headers: {
                ...headers,
                'content-type': 'application/json',
                host: new URL(targetUrl).host
            },
            body: JSON.stringify(req.body)
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.delete('/auth/funcionarios/:id', authenticateJWT, authenticateFuncionario, async (req, res) => {
    const targetUrl = `${MS_AUTENTICACAO_URL}/funcionarios/${req.params.id}`;
    console.log(`[API Gateway] Rota DELETE ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        // busca o funcionário para obter o CPF e impedir auto inativação
        try {
            const verificaResp = await fetch(targetUrl, {
                method: 'GET',
                headers: { host: new URL(targetUrl).host }
            });
            if (verificaResp.ok) {
                const funcionario = await verificaResp.json();
                if (funcionario.cpf === req.user.cpf) {
                    return res.status(403).json({ erro: 'Funcionário não pode inativar a si mesmo' });
                }
            }
        } catch (err) {
            console.error(`[API Gateway] Falha ao verificar funcionário ${req.params.id}`, err);
        }

        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'DELETE',
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            }
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.use('/auth', authenticateJWT, async (req, res) => {
    const pathSuffix = req.originalUrl.substring('/auth'.length);
    const targetUrl = `${MS_AUTENTICACAO_URL}${pathSuffix}`;
    console.log(`[API Gateway] Rota ${req.method} ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const options = {
            method: req.method,
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            },
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
            options.body = JSON.stringify(req.body);
            if (!options.headers['content-type']?.includes('application/json')) {
                options.headers['content-type'] = 'application/json';
            }
        }
        
        const response = await fetch(targetUrl, options);
        const responseBody = await response.text();

        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }

    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.use('/pacientes/interno', async (req, res) => {
    const pathSuffix = req.originalUrl.substring('/pacientes'.length);
    const targetUrl = `${MS_PACIENTE_URL}${pathSuffix}`;
    console.log(`[API Gateway] Rota ${req.method} ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const options = {
            method: req.method,
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            },
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
            options.body = JSON.stringify(req.body);
            if (!options.headers['content-type']?.includes('application/json')) {
                options.headers['content-type'] = 'application/json';
            }
        }
        
        const response = await fetch(targetUrl, options);
        const responseBody = await response.text();

        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }

    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

// Rotas específicas para pacientes - suporte aos novos endpoints REST
app.get('/pacientes/:cpf', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_PACIENTE_URL}/${req.params.cpf}`;
    console.log(`[API Gateway] Rota GET ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            }
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.get('/pacientes/:cpf/transacoes', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_PACIENTE_URL}/${req.params.cpf}/transacoes`;
    console.log(`[API Gateway] Rota GET ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            }
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.get('/pacientes/:cpf/saldo', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_PACIENTE_URL}/${req.params.cpf}/saldo`;
    console.log(`[API Gateway] Rota GET ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            }
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

// NOVO: Comprar pontos - PUT /pacientes/{cpf}/pontos
app.put('/pacientes/:cpf/pontos', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_PACIENTE_URL}/${req.params.cpf}/pontos`;
    console.log(`[API Gateway] Rota PUT ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'PUT',
            headers: {
                ...headers,
                'content-type': 'application/json',
                host: new URL(targetUrl).host
            },
            body: JSON.stringify(req.body)
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

// NOVO: Debitar pontos - PUT /pacientes/{cpf}/pontos/debitar
app.put('/pacientes/:cpf/pontos/debitar', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_PACIENTE_URL}/${req.params.cpf}/pontos/debitar`;
    console.log(`[API Gateway] Rota PUT ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'PUT',
            headers: {
                ...headers,
                'content-type': 'application/json',
                host: new URL(targetUrl).host
            },
            body: JSON.stringify(req.body)
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

// NOVO: Creditar pontos - PUT /pacientes/{cpf}/pontos/creditar
app.put('/pacientes/:cpf/pontos/creditar', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_PACIENTE_URL}/${req.params.cpf}/pontos/creditar`;
    console.log(`[API Gateway] Rota PUT ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'PUT',
            headers: {
                ...headers,
                'content-type': 'application/json',
                host: new URL(targetUrl).host
            },
            body: JSON.stringify(req.body)
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.get('/consultas/disponiveis', async (req, res) => {
    const pathSuffix = req.originalUrl.substring('/consultas'.length);
    const targetUrl = `${MS_CONSULTA_URL}${pathSuffix}`;
    console.log(`[API Gateway] Rota GET ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length']; 

        const options = {
            method: 'GET', 
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            },
        };
        
        const response = await fetch(targetUrl, options);
        const responseBody = await response.text();

        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }

    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.use('/consultas/interno', async (req, res) => {
    const pathSuffix = req.originalUrl.substring('/consultas'.length);
    const targetUrl = `${MS_CONSULTA_URL}${pathSuffix}`;
    console.log(`[API Gateway] Rota ${req.method} ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const options = {
            method: req.method,
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            },
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
            options.body = JSON.stringify(req.body);
            if (!options.headers['content-type']?.includes('application/json')) {
                options.headers['content-type'] = 'application/json';
            }
        }
        
        const response = await fetch(targetUrl, options);
        const responseBody = await response.text();

        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }

    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

// Rotas específicas para agendamentos - novos endpoints REST
app.post('/agendamentos', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_CONSULTA_URL}/agendamentos`;
    console.log(`[API Gateway] Rota POST ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                ...headers,
                'content-type': 'application/json',
                host: new URL(targetUrl).host
            },
            body: JSON.stringify(req.body)
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

// NOVO: Cancelar agendamento - DELETE /agendamentos/{codigo}
app.delete('/agendamentos/:codigo', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_CONSULTA_URL}/agendamentos/${req.params.codigo}?pacienteCpf=${req.query.pacienteCpf}`;
    console.log(`[API Gateway] Rota DELETE ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'DELETE',
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            }
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});
app.delete('/agendamentos/:codigo/funcionario', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_CONSULTA_URL}/agendamentos/${req.params.codigo}/funcionario`;
    console.log(`[API Gateway] Rota DELETE ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'DELETE',
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            }
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

// NOVO: Check-in - PUT /agendamentos/{codigo}/status
app.put('/agendamentos/:codigo/status', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_CONSULTA_URL}/agendamentos/${req.params.codigo}/status`;
    console.log(`[API Gateway] Rota PUT ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'PUT',
            headers: {
                ...headers,
                'content-type': 'application/json',
                host: new URL(targetUrl).host
            },
            body: JSON.stringify(req.body)
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

// NOVO: Confirmar comparecimento - PUT /agendamentos/{codigo}/comparecimento
app.put('/agendamentos/:codigo/comparecimento', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_CONSULTA_URL}/agendamentos/${req.params.codigo}/comparecimento`;
    console.log(`[API Gateway] Rota PUT ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'PUT',
            headers: {
                ...headers,
                'content-type': 'application/json',
                host: new URL(targetUrl).host
            },
            body: JSON.stringify(req.body)
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.get('/agendamentos/proximas48h', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_CONSULTA_URL}/agendamentos/proximas48h`;
    console.log(`[API Gateway] Rota GET ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            }
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.get('/agendamentos/paciente/:cpf', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_CONSULTA_URL}/agendamentos/paciente/${req.params.cpf}`;
    console.log(`[API Gateway] Rota GET ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            }
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.get('/agendamentos/paciente/:cpf/proximas48h', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_CONSULTA_URL}/agendamentos/paciente/${req.params.cpf}/proximas48h`;
    console.log(`[API Gateway] Rota GET ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            }
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

// Rotas específicas para consultas - novos endpoints REST
app.post('/consultas', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_CONSULTA_URL}/consultas`;
    console.log(`[API Gateway] Rota POST ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                ...headers,
                'content-type': 'application/json',
                host: new URL(targetUrl).host
            },
            body: JSON.stringify(req.body)
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

// NOVO: Cancelar consulta - DELETE /consultas/{codigo}
app.delete('/consultas/:codigo', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_CONSULTA_URL}/consultas/${req.params.codigo}`;
    console.log(`[API Gateway] Rota DELETE ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'DELETE',
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            }
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

// NOVO: Realizar consulta - PUT /consultas/{codigo}/status
app.put('/consultas/:codigo/status', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_CONSULTA_URL}/consultas/${req.params.codigo}/status`;
    console.log(`[API Gateway] Rota PUT ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'PUT',
            headers: {
                ...headers,
                'content-type': 'application/json',
                host: new URL(targetUrl).host
            },
            body: JSON.stringify(req.body)
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.get('/consultas/proximas48h', authenticateJWT, async (req, res) => {
    const targetUrl = `${MS_CONSULTA_URL}/proximas48h`;
    console.log(`[API Gateway] Rota GET ${req.originalUrl} -> Proxy manual para ${targetUrl}`);

    try {
        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['connection'];
        delete headers['content-length'];

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                ...headers,
                host: new URL(targetUrl).host
            }
        });

        const responseBody = await response.text();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            if (!['transfer-encoding', 'connection', 'content-encoding'].includes(name.toLowerCase())) {
                responseHeaders[name] = value;
            }
        });

        res.status(response.status).set(responseHeaders);
        try {
            res.json(JSON.parse(responseBody));
        } catch (e) {
            res.send(responseBody);
        }
    } catch (error) {
        console.error(`[API Gateway] Erro no proxy manual para ${req.originalUrl}: ${targetUrl}`, error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ erro: 'Serviço indisponível', detalhes: `Não foi possível conectar a ${targetUrl}` });
        } else {
            res.status(502).json({ erro: 'Bad Gateway', detalhes: error.message });
        }
    }
});

app.get('/gateway-health', (req, res) => {
    res.status(200).json({ status: 'API Gateway rodando!', port: PORT });
});

app.listen(PORT, () => {
    console.log(`API Gateway rodando na porta ${PORT}`);
    console.log(` -> Proxying /auth para ${MS_AUTENTICACAO_URL}`);
    console.log(` -> Proxying /pacientes para ${MS_PACIENTE_URL}`);
    console.log(` -> Proxying /agendamentos para ${MS_CONSULTA_URL}`);
    console.log(` -> Proxying /consultas para ${MS_CONSULTA_URL}`);
});
