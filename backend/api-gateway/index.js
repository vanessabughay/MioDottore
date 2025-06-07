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
const MS_CONSULTA_URL = process.env.CONSULTA_URL || 'http://localhost:8083'; 
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


app.use('/auth/funcionarios', authenticateJWT, authenticateFuncionario, async (req, res) => {
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

app.use('/pacientes', authenticateJWT, async (req, res) => {

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

app.use('/consultas', authenticateJWT, async (req, res) => {

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

app.get('/gateway-health', (req, res) => {
    res.status(200).json({ status: 'API Gateway rodando!', port: PORT });
});

app.listen(PORT, () => {
    console.log(`API Gateway rodando na porta ${PORT}`);
    console.log(` -> Proxying /auth para ${MS_AUTENTICACAO_URL}`);
    console.log(` -> Proxying /pacientes para ${MS_PACIENTE_URL}`);
    console.log(` -> Proxying /consultas para ${MS_CONSULTA_URL}`);
});
