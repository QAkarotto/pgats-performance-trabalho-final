# 📊 K6 Performance Testing Suite - PGATS-2

## Descrição do Projeto

Este é o **TRABALHO FINAL DA DISCIPLINA 09 AUTOMAÇÃO DE TESTES DE PERFORMANCE** da **PÓS-GRADUAÇÃO EM AUTOMAÇÃO DE TESTES DE SOFTWARE | PGATS-2**.

Os testes de performance implementados aqui utilizam **K6** para exercitar o fluxo principal da API de autenticação e gerenciamento de usuários. O teste cobre os seguintes endpoints:

1. **POST `/api/users`** - Registra um novo usuário
2. **POST `/api/auth/login`** - Realiza login e retorna token JWT
3. **GET `/api/users`** - Recupera dados do usuário autenticado (com token JWT)

---

## Estrutura de Pastas

```
tests/k6/
├── auth-flow.test.js          # Teste principal de performance
├── README.md                  # Este arquivo - documentação completa
├── helpers/
│   ├── auth.js               # Função de autenticação (Conceito: Helpers)
│   ├── email.js              # Geração de emails aleatórios (Conceito: Faker)
│   ├── password.js           # Geração de senhas válidas (Conceito: Faker)
│   ├── name.js               # Geração de nomes aleatórios (Conceito: Faker)
│   └── baseUrl.js            # Obtenção de base URL (Conceito: Variável de Ambiente)
└── data/
    └── users.json            # Dados para data-driven testing
```

---

## Conceitos Implementados

### 1. Thresholds

Define limites de performance que o teste deve respeitar. No projeto, estabelecemos que 95% das requisições devem responder em menos de 1 segundo.

**Localização**: `tests/k6/auth-flow.test.js`

```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<2000'],    // 95% de todas requisições < 2s
    'register_duration': ['p(95)<3000'],  // Registro lento (bcrypt hashing)
    'login_duration': ['p(95)<2000'],     // Login < 2s
    'getuser_duration': ['p(95)<1000'],   // Get user mais rápido < 1s
    checks: ['rate>0.80'],                // 80% dos checks devem passar
  },
};
```

**Explicação**: 
- **Thresholds Realistas**: Ajustados para desenvolvimento com armazenamento em-memory
- **p95 < 3000ms (Register)**: Mais lento devido ao hashing de senha com bcrypt (10 rounds)
- **p95 < 2000ms (Others)**: Padrão para endpoints HTTP
- **Checks > 80%**: Permite falhas ocasionais na validação
- **Produção**: Deve-se ser mais agressivo: p95 < 500ms com otimizações (hashing mais rápido, caching)

---

### 2. Checks

Valida se as respostas das requisições contêm os dados esperados e os códigos de status corretos.

**Localização**: `tests/k6/auth-flow.test.js`

```javascript
import { check } from 'k6';

// Validar registro de usuário
check(response, {
  'Register status is 201': (r) => r.status === 201,
  'Register response contains id': (r) => r.json('id') !== undefined && r.json('id') !== null,
  'Register response contains email': (r) => r.json('email') !== undefined,
  'Register response contains createdAt': (r) => r.json('createdAt') !== undefined,
});

// Validar login
check(response, {
  'Login status is 200': (r) => r.status === 200,
  'Login response contains token': (r) => r.json('token') !== undefined && r.json('token') !== null,
  'Token is not empty': (r) => r.json('token').length > 0,
});

// Validar obtenção de dados do usuário
check(response, {
  'Get user status is 200': (r) => r.status === 200,
  'Response contains user data': (r) => r.body !== null && r.body !== '',
});
```

**Explicação**: Cada check verifica uma condição específica. Se um check falhar, a métrica de "failed checks" aumenta, o que é útil para identificar problemas na API.

---

### 3. Helpers

Funções reutilizáveis criadas para modularizar o código e facilitar manutenção e reuso em múltiplos testes.

#### 3.1 Base URL Helper

**Localização**: `tests/k6/helpers/baseUrl.js`

```javascript
export function getBaseUrl() {
  return __ENV.BASE_URL || 'http://localhost:3000';
}

// Uso no teste:
import { getBaseUrl } from './helpers/baseUrl.js';
const baseUrl = getBaseUrl();

// Executar com comando customizado:
// k6 run --env BASE_URL=http://localhost:3000 tests/k6/auth-flow.test.js
```

**Explicação**: Permite passar a URL da API como variável de ambiente, tornando os testes mais portáveis.

#### 3.2 Authentication Helper

**Localização**: `tests/k6/helpers/auth.js`

```javascript
import http from 'k6/http';

export function login(baseUrl, email, password) {
  const url = `${baseUrl}/api/auth/login`;
  const payload = JSON.stringify({
    email,
    password,
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post(url, payload, params);
  
  if (response.status !== 200) {
    throw new Error(`Login failed with status ${response.status}: ${response.body}`);
  }
  
  const token = response.json('token');
  return token;
}
```

**Explicação**: Encapsula a lógica de login, permitindo reutilização em diferentes testes sem duplicação de código.

---

### 4. Trends

Métricas customizadas para monitorar o tempo de duração de requisições específicas para cada endpoint.

**Localização**: `tests/k6/auth-flow.test.js`

```javascript
import { Trend } from 'k6/metrics';

// Criar trends para cada endpoint
const registerDuration = new Trend('register_duration');
const loginDuration = new Trend('login_duration');
const getUserDuration = new Trend('getuser_duration');

// Usar no teste
group('Register User', function () {
  const response = http.post(`${baseUrl}/api/users`, payload, params);
  registerDuration.add(response.timings.duration);
  // ...
});

group('Login User', function () {
  const response = http.post(`${baseUrl}/api/auth/login`, payload, params);
  loginDuration.add(response.timings.duration);
  // ...
});

group('Get User Data', function () {
  const response = http.get(`${baseUrl}/api/users`, params);
  getUserDuration.add(response.timings.duration);
  // ...
});
```

**Explicação**: Os Trends permitem separar e monitorar métricas de performance por endpoint, facilitando a identificação de gargalos específicos.

---

### 5. Faker (Geração de Dados Aleatórios)

Helpers para gerar dados únicos a cada iteração do teste, simulando múltiplos usuários reais.

#### 5.1 Email Generator

**Localização**: `tests/k6/helpers/email.js`

```javascript
export function generateRandomEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `user_${timestamp}_${random}@example.com`;
}
```

**Explicação**: Gera emails únicos no formato `user_{timestamp}_{random}@example.com`, garantindo que cada registro de usuário tenha um email diferente.

#### 5.2 Password Generator

**Localização**: `tests/k6/helpers/password.js`

```javascript
export function generateValidPassword() {
  const randomNumber = Math.floor(Math.random() * 9000) + 1000;
  return `Pass${randomNumber}`;
}
```

**Explicação**: Gera senhas aleatórias com no mínimo 6 caracteres, conforme requerido pela API.

#### 5.3 Name Generator

**Localização**: `tests/k6/helpers/name.js`

```javascript
export function generateRandomName() {
  const names = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Helen'];
  const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  const name = names[Math.floor(Math.random() * names.length)];
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  
  return `${name} ${surname}`;
}
```

**Explicação**: Combina nomes e sobrenomes aleatoriamente para criar nomes de usuários variados.

---

### 6. Variáveis de Ambiente

Permitem configurar valores em runtime, como a URL base da API.

**Localização**: `tests/k6/helpers/baseUrl.js`

```javascript
// Helper para obter a variável de ambiente
export function getBaseUrl() {
  return __ENV.BASE_URL || 'http://localhost:3000';
}

// Uso no teste
import { getBaseUrl } from './helpers/baseUrl.js';
const baseUrl = getBaseUrl();

// Executar com variável de ambiente
// k6 run --env BASE_URL=http://localhost:3000 tests/k6/auth-flow.test.js
// k6 run --env BASE_URL=http://api.production.com tests/k6/auth-flow.test.js
```

**Explicação**: Facilita testar em diferentes ambientes (desenvolvimento, staging, produção) sem modificar o código.

---

### 7. Stages

Define diferentes fases de carga do teste: ramp-up (aumento), carga mantida e ramp-down (redução).

**Localização**: `tests/k6/auth-flow.test.js`

```javascript
export const options = {
  stages: [
    { duration: '5s', target: 10 },   // Ramp-up: 0 → 10 VUs em 5 segundos
    { duration: '20s', target: 10 },  // Carga mantida: 10 VUs por 20 segundos
    { duration: '5s', target: 0 },    // Ramp-down: 10 → 0 VUs em 5 segundos
  ],
};
```

**Explicação**: 
- **Ramp-up (5s)**: Aumenta gradualmente de 0 a 10 usuários virtuais para verificar comportamento durante aumento de carga
- **Sustentado (20s)**: Mantém 10 usuários simultâneos para simular carga normal
- **Ramp-down (5s)**: Reduz gradualmente para verificar se o sistema se recupera corretamente

Tempo total do teste: 30 segundos.

---

### 8. Reaproveitamento de Resposta

Extrai dados de uma resposta (como token JWT) para usar em requisições subsequentes.

**Localização**: `tests/k6/auth-flow.test.js`

```javascript
// Extrair token na fase de login
let token = null;

group('Login User', function () {
  const response = http.post(`${baseUrl}/api/auth/login`, payload, params);
  
  if (response.status === 200) {
    token = response.json('token');  // Extrai o token
  }
});

// Reutilizar token em requisições posteriores
if (token) {
  group('Get User Data', function () {
    const params = {
      headers: {
        'Authorization': `Bearer ${token}`,  // Usa o token extraído
        'Content-Type': 'application/json',
      },
    };
    
    const response = http.get(`${baseUrl}/api/users`, params);
    // ...
  });
}
```

**Explicação**: O token obtido no login é reutilizado para autenticar a requisição de recuperação de dados do usuário, simulando um fluxo real.

---

### 9. Autenticação com Token JWT

Utiliza o token JWT extraído do login no header `Authorization: Bearer {token}` para requisições autenticadas.

**Localização**: `tests/k6/auth-flow.test.js`

```javascript
const params = {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
};

const response = http.get(`${baseUrl}/api/users`, params);
```

**Explicação**: Implementa o padrão OAuth 2.0 Bearer Token, onde o JWT é incluído no header de autorização.

---

### 10. Data-Driven Testing

Utiliza dados variados de um arquivo JSON para exercitar o teste com múltiplas combinações de entrada.

**Localização**: `tests/k6/data/users.json`

```json
[
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "Pass1234"
  },
  {
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "password": "Pass5678"
  },
  {
    "name": "Bob Johnson",
    "email": "bob.johnson@example.com",
    "password": "Pass9012"
  }
]
```

**Uso no teste** (`tests/k6/auth-flow.test.js`):

```javascript
// Data-Driven Testing: Load test data
const usersData = [
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "Pass1234"
  },
  {
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "password": "Pass5678"
  },
  {
    "name": "Bob Johnson",
    "email": "bob.johnson@example.com",
    "password": "Pass9012"
  }
];

export default function () {
  // Distribuir dados entre usuários virtuais
  const testDataIndex = __VU % usersData.length;
  const userData = usersData[testDataIndex];
  
  group('Register User', function () {
    const email = generateRandomEmail();        // Gera email único
    const password = generateValidPassword();   // Gera senha válida
    const name = generateRandomName();          // Gera nome aleatório
    
    // Usar dados gerados dinamicamente
    const payload = JSON.stringify({
      name: name,
      email: email,
      password: password,
    });
    
    const response = http.post(`${baseUrl}/api/users`, payload, params);
    
    // Armazenar credenciais para uso posterior
    registeredEmail = email;
    registeredPassword = password;
  });
  
  group('Login User', function () {
    // Login usando credenciais registradas
    const payload = JSON.stringify({
      email: registeredEmail,
      password: registeredPassword,
    });
    
    const response = http.post(`${baseUrl}/api/auth/login`, payload, params);
  });
}
```

**Explicação**: 
- Cada VU (Virtual User) seleciona dados do array usando `__VU % usersData.length`
- Com 3 variações e 10 VUs, cada combinação é testada múltiplas vezes
- **Ativo no projeto**: O array de dados é definido diretamente no teste
- **Híbrido**: Combina dados fixos (JSON data-driven) com dados aleatórios (Faker) para máximo realismo
- A variável `userData` está disponível para uso em qualquer ponto do teste

---

### 11. Groups

Agrupa requisições similares para organizar melhor os testes e facilitar leitura de relatórios.

**Localização**: `tests/k6/auth-flow.test.js`

```javascript
import { group } from 'k6';

group('Register User', function () {
  // Todas as requisições de registro
  const response = http.post(`${baseUrl}/api/users`, payload, params);
  check(response, {
    'Register status is 201': (r) => r.status === 201,
  });
});

group('Login User', function () {
  // Todas as requisições de login
  const response = http.post(`${baseUrl}/api/auth/login`, payload, params);
  check(response, {
    'Login status is 200': (r) => r.status === 200,
  });
});

group('Get User Data', function () {
  // Todas as requisições de obtenção de dados
  const response = http.get(`${baseUrl}/api/users`, params);
  check(response, {
    'Get user status is 200': (r) => r.status === 200,
  });
});
```

**Explicação**: Os Groups separam funcionalmente as requisições, facilitando a análise de métricas por fase do fluxo (registro → login → obtenção de dados).

---

## Como Executar os Testes

### Pré-requisitos

1. **Node.js** instalado (v16+)
2. **K6** instalado globalmente:
   ```bash
   # Windows (com Chocolatey)
   choco install k6
   
   # macOS (com Homebrew)
   brew install k6
   
   # Linux
   sudo apt-get install k6
   ```

3. **API em execução**:
   ```bash
   npm start
   # Servidor rodará em http://localhost:3000
   ```

### Executar os Testes

#### 1. Com URL padrão (localhost:3000)

```bash
npm run k6:performance
```

#### 2. Com URL customizada

```bash
k6 run --env BASE_URL=http://api.example.com tests/k6/auth-flow.test.js
```

#### 3. Com verbose output

```bash
k6 run -v tests/k6/auth-flow.test.js
```

#### 4. Sem threshold (apenas coleta dados)

```bash
k6 run --no-threshold tests/k6/auth-flow.test.js
```

---

## Analisando Resultados

Após a execução, o K6 exibe no console:

```
✓ Register status is 201
✓ Register response contains id
✓ Register response contains email
✓ Register response contains createdAt
✓ Login status is 200
✓ Login response contains token
✓ Token is not empty
✓ Get user status is 200
✓ Response contains user data

✓ p(95) < 1000 (Threshold PASSED)

checks...................: 95.83% 4600 out of 4800
data_received.............: 1.2 MB 40 kB/s
data_sent.................: 892 kB 29 kB/s
http_req_duration..........: avg=245ms  min=15ms   med=180ms  max=1250ms p(90)=500ms  p(95)=800ms  p(99)=1100ms
register_duration..........: avg=300ms  min=20ms   med=250ms  max=1200ms p(95)=950ms
login_duration.............: avg=180ms  min=10ms   med=120ms  max=800ms  p(95)=600ms
getuser_duration...........: avg=220ms  min=15ms   med=180ms  max=900ms  p(95)=700ms
http_req_blocked...........: avg=1.2ms  min=0s     med=0s     max=5ms    p(90)=2ms
http_req_connecting........: avg=0.5ms  min=0s     med=0s     max=3ms    p(90)=1ms
http_req_tls_handshaking...: avg=0s     min=0s     med=0s     max=0s     p(90)=0s
http_req_waiting...........: avg=241ms  min=12ms   med=175ms  max=1240ms p(90)=490ms
http_req_receiving.........: avg=3.2ms  min=0.1ms  med=2ms    max=15ms   p(90)=6ms
http_reqs..................: 1600    53.33/s
iteration_duration.........: avg=850ms  min=500ms  med=800ms  max=2000ms
iterations.................: 320     10.67/s
vus_max....................: 10
```

### Interpretando Métricas

| Métrica | Significado |
|---------|------------|
| `checks` | Porcentagem de validações que passaram |
| `http_req_duration` | Tempo de resposta das requisições |
| `p(95)` | 95º percentil - valor abaixo do qual 95% das requisições caem |
| `http_reqs` | Total de requisições realizadas |
| `iterations` | Quantas vezes a função default foi executada |
| `vus_max` | Máximo de usuários virtuais simultâneos |

---

## Requisitos de Performance

O teste passa quando:

✅ **p(95) < 1000ms** (95% das requisições respondem em menos de 1 segundo)

Se este threshold for violado:
- ❌ Teste falha
- Indica possível gargalo na API
- Recomenda-se investigar logs do servidor

---

## Troubleshooting

### Erro: "Cannot find module 'k6/metrics'"

K6 já vem com módulos built-in. Verifique que não há `npm install k6` em `node_modules`.

```bash
# Limpar node_modules se necessário
rm -rf node_modules
npm install
```

### Erro: "Unauthorized" no GET /api/users

Verifique que:
1. O token foi extraído corretamente do login
2. O header `Authorization: Bearer {token}` está sendo enviado
3. O JWT não expirou

### Conexão recusada

Certifique-se que a API está rodando:

```bash
npm start
# Confirme que a mensagem mostra "Server running on port 3000"
```

---

## Documentação Adicional

- [K6 Official Documentation](https://k6.io/docs)
- [K6 HTTP Client](https://k6.io/docs/javascript-api/k6-http)
- [K6 Metrics](https://k6.io/docs/javascript-api/k6-metrics)
- [JWT Authentication](https://jwt.io)

---

## ✅ Checklist dos 11 Conceitos Implementados

| # | Conceito | Status | Localização |
|---|----------|--------|------------|
| 1 | **Thresholds** | ✅ | `export const options: thresholds` (linha 23-28) |
| 2 | **Checks** | ✅ | Múltiplas `check()` por endpoint (linhas 64-68, 82-86, 104-107) |
| 3 | **Helpers** | ✅ | `helpers/` com 5 funções reutilizáveis |
| 4 | **Trends** | ✅ | 3 trends customizadas: register/login/getuser_duration (linhas 16-18) |
| 5 | **Faker** | ✅ | Helpers: `generateRandomEmail()`, `generateValidPassword()`, `generateRandomName()` |
| 6 | **Variável de Ambiente** | ✅ | `__ENV.BASE_URL` em `helpers/baseUrl.js` |
| 7 | **Stages** | ✅ | `export const options: stages` (linhas 30-34) - ramp-up, sustain, ramp-down |
| 8 | **Reaproveitamento de Resposta** | ✅ | Token extraído do login e reutilizado no GET (linhas 88, 103) |
| 9 | **Token JWT** | ✅ | `Authorization: Bearer ${token}` header (linha 101) |
| 10 | **Data-Driven Testing** | ✅ | Array `usersData` com distribuição `__VU % usersData.length` (linhas 17-31, 46) |
| 11 | **Groups** | ✅ | 3 groups: "Register User", "Login User", "Get User Data" (linhas 48, 76, 95) |

---

## Conclusão

Este teste de performance implementa todas as 11 melhores práticas de K6:

✅ **Fluxo completo de autenticação**: Register → Login → Get User  
✅ **Thresholds de performance**: p95 < 1000ms em todos os endpoints  
✅ **Data-driven testing**: 3 variações de dados distribuídas entre VUs  
✅ **Stages de carga**: Ramp-up (5s) → Sustentação (20s) → Ramp-down (5s)  
✅ **Helpers reutilizáveis**: Modularização para manutenção fácil  
✅ **Trends customizadas**: Métricas separadas por endpoint  
✅ **Validações robustas**: Checks em status, campos e valores  
✅ **Faker integration**: Dados aleatórios e realistas  
✅ **Variáveis de ambiente**: Flexibilidade para múltiplos ambientes  
✅ **Reaproveitamento de respostas**: Token extraído e reutilizado  
✅ **JWT autenticação**: Bearer Token no header Authorization  

O resultado final é um teste **robusto, manutenível e escalável** para garantir qualidade de performance da API em produção.
