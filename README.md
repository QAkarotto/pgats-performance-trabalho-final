# 🚀 Testes de Performance com K6 - Car Rental API

<div align="center">

![K6](https://img.shields.io/badge/K6-7D64FF?style=for-the-badge&logo=k6&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**Trabalho Final - Pós-Graduação em Automação de Testes de Software**  
**Disciplina:** Automação de Testes de Performance

</div>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Como Executar](#-como-executar)
- [Conceitos Implementados](#-conceitos-implementados)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Resultados e Métricas](#-resultados-e-métricas)
- [Autor](#-autor)

---

## 🎯 Sobre o Projeto

Este projeto implementa **testes de performance automatizados** utilizando **K6** para validar o comportamento de uma API REST de sistema de aluguel de carros sob diferentes condições de carga. O teste foi desenvolvido como trabalho final da disciplina de Automação de Testes de Performance da Pós-Graduação em Automação de Testes de Software.

### Objetivo

Avaliar a capacidade da API de suportar múltiplos usuários simultâneos, garantindo que:
- ✅ Os tempos de resposta permaneçam dentro dos limites aceitáveis
- ✅ O sistema mantenha sua integridade sob carga
- ✅ A autenticação JWT funcione corretamente em cenários de alta concorrência
- ✅ Todos os endpoints críticos respondam adequadamente

### Estratégias de Teste

O projeto implementa **duas estratégias complementares** de geração de dados:

1. **Data-Driven Testing (Grupo 01)**: Utiliza dados pré-gerados do arquivo `users.json`
2. **Faker Runtime (Grupo 02)**: Gera dados dinamicamente usando a extensão `k6/x/faker`

---

## 🛠 Tecnologias Utilizadas

- **[K6](https://k6.io/)** - Ferramenta de testes de performance
- **[xk6-faker](https://github.com/szkiba/xk6-faker)** - Extensão K6 para geração de dados fake
- **Node.js** - Para scripts auxiliares de geração de dados
- **Faker.js** - Biblioteca para geração de dados realistas

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 16.0.0
- **npm** >= 7.0.0
- **Go** >= 1.19 (para compilar a extensão xk6-faker)
- **Git**

---

## 🔧 Instalação

### 1️⃣ Instalar K6

#### Windows (Chocolatey)
```bash
choco install k6
```

#### macOS (Homebrew)
```bash
brew install k6
```

#### Linux (Debian/Ubuntu)
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### 2️⃣ Instalar Go (necessário para xk6-faker)

#### Windows (Chocolatey)
```bash
choco install golang
```

#### macOS (Homebrew)
```bash
brew install go
```

#### Linux (Debian/Ubuntu)
```bash
sudo apt install golang-go
```

### 3️⃣ Instalar xk6 (K6 Extension Builder)

```bash
go install go.k6.io/xk6/cmd/xk6@latest
```

### 4️⃣ Compilar K6 com a extensão xk6-faker

```bash
xk6 build --with github.com/grafana/xk6-faker@latest
```

> 💡 **Importante:** Este comando cria um executável `k6` (ou `k6.exe` no Windows) no diretório atual com a extensão faker integrada. Use este executável customizado para rodar os testes.

### 5️⃣ Instalar dependências do projeto

```bash
npm install
```

### 6️⃣ Gerar dados de teste

```bash
npm run generate:fake-data
```

---

## ▶️ Como Executar

### Iniciar a API

Primeiro, certifique-se de que a API está rodando:

```bash
npm start
```

Ou em modo desenvolvimento:

```bash
npm run dev
```

### Executar os Testes de Performance

```bash
npm run test:performance
```

### Visualizar Relatórios

Após a execução, o teste gera automaticamente:

- **report.html** - Relatório visual completo
- **results.json** - Dados brutos em JSON

Para abrir o relatório HTML:

```bash
# Windows
start report.html

# macOS
open report.html

# Linux
xdg-open report.html
```

---

## 🎓 Conceitos Implementados

Este projeto demonstra a aplicação prática de **11 conceitos fundamentais** de testes de performance com K6:

### 1. 📊 Thresholds

**Localização:** `tests/k6/auth-flow.test.js` (linhas 21-31)

Os **Thresholds** (limites) definem critérios de aceitação para o teste. Se algum threshold for violado, o teste falha.

```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    'register_duration': ['p(95)<3000'],
    'login_duration': ['p(95)<2000'],
    'getuser_duration': ['p(95)<1000'],
    'faker_register_duration': ['p(95)<3000'],
    'faker_login_duration': ['p(95)<2000'],
    'faker_getuser_duration': ['p(95)<1000'],
    checks: ['rate>0.80'],
  },
```

**Explicação:** O código acima está armazenado no arquivo `tests/k6/auth-flow.test.js` e demonstra o uso de **Thresholds**. Definimos que 95% das requisições devem ter duração inferior aos valores especificados (p95 < 2000ms para requisições gerais, p95 < 3000ms para registro, etc.). Além disso, estabelecemos que pelo menos 80% dos checks devem passar. O teste é considerado falho se qualquer um destes limites for ultrapassado.

---

### 2. ✅ Checks

**Localização:** `tests/k6/auth-flow.test.js` (linhas 76-81)

Os **Checks** são validações que verificam se as respostas estão corretas, sem interromper o fluxo do teste.

```javascript
check(response, {
  'Register status is 201': (r) => r.status === 201,
  'Register response contains id': (r) => r.json('id') !== undefined && r.json('id') !== null,
  'Register response contains email': (r) => r.json('email') !== undefined,
  'Register response contains createdAt': (r) => r.json('createdAt') !== undefined,
});
```

**Explicação:** O código acima está armazenado no arquivo `tests/k6/auth-flow.test.js` e demonstra o uso de **Checks**. Validamos que o endpoint de registro retorna status HTTP 201 (Created) e que a resposta contém todos os campos obrigatórios (id, email, createdAt). Os checks são executados após cada requisição e seus resultados são agregados nas métricas finais, mas não interrompem o teste mesmo se falharem.

---

### 3. 🔧 Helpers

**Localização:** `tests/k6/helpers/baseUrl.js`

Os **Helpers** são funções reutilizáveis que encapsulam lógica comum, facilitando a manutenção.

```javascript
export function getBaseUrl() {
  return __ENV.BASE_URL || 'http://localhost:3000';
}
```

**Uso no teste principal** (`tests/k6/auth-flow.test.js`, linhas 5 e 9):
```javascript
import { getBaseUrl } from './helpers/baseUrl.js';

const baseUrl = getBaseUrl();
```

**Explicação:** O código acima está armazenado no arquivo `tests/k6/helpers/baseUrl.js` e demonstra o uso de **Helpers**. Criamos uma função reutilizável que obtém a URL base da API. Esta função é importada no teste principal e utilizada em todas as requisições HTTP. Isso centraliza a configuração da URL e facilita a execução do teste em diferentes ambientes sem modificar o código do teste.

---

### 4. 📈 Trends (Métricas Customizadas)

**Localização:** `tests/k6/auth-flow.test.js` (linhas 11-16 e linha 74)

As **Trends** são métricas customizadas que rastreiam valores ao longo do tempo e calculam estatísticas.

**Declaração das Trends:**
```javascript
const registerDuration = new Trend('register_duration');
const loginDuration = new Trend('login_duration');
const getUserDuration = new Trend('getuser_duration');
const fakerRegisterDuration = new Trend('faker_register_duration');
const fakerLoginDuration = new Trend('faker_login_duration');
const fakerGetUserDuration = new Trend('faker_getuser_duration');
```

**Uso no teste (linha 74):**
```javascript
const response = http.post(`${baseUrl}/api/users`, payload, params);
registerDuration.add(response.timings.duration);
```

**Explicação:** O código acima está armazenado no arquivo `tests/k6/auth-flow.test.js` e demonstra o uso de **Trends**. Criamos 6 métricas customizadas para rastrear a duração de cada operação (3 para data-driven testing e 3 para faker). Após cada requisição, adicionamos o tempo de resposta à trend correspondente usando o método `.add()`. O K6 automaticamente calcula estatísticas como média, mediana, percentis (p90, p95, p99), valores mínimo e máximo.

---

### 5. 🎭 Faker (k6/x/faker)

**Localização:** `tests/k6/auth-flow.test.js` (linha 7 e linhas 141-143)

A extensão **xk6-faker** permite gerar dados realistas em tempo de execução.

**Importação:**
```javascript
import faker from 'k6/x/faker';
```

**Uso no Grupo 02 (linhas 141-143):**
```javascript
group('Register User with Faker Data', function () {
  const email = faker.person.email()
  const password = faker.internet.password();
  const name = faker.person.name()
```

**Explicação:** O código acima está armazenado no arquivo `tests/k6/auth-flow.test.js` e demonstra o uso de **Faker (k6/x/faker)**. A extensão xk6-faker é importada na linha 7 e utilizada no Grupo 02 para gerar dados únicos e realistas a cada iteração. Usamos `faker.person.email()` para emails válidos, `faker.internet.password()` para senhas seguras e `faker.person.name()` para nomes completos. Isso simula um cenário mais próximo da realidade, onde cada usuário tem dados únicos.

---

### 6. 🌍 Variáveis de Ambiente

**Localização:** `tests/k6/helpers/baseUrl.js`

As **Variáveis de Ambiente** permitem configurar o teste dinamicamente via linha de comando.

```javascript
export function getBaseUrl() {
  return __ENV.BASE_URL || 'http://localhost:3000';
}
```

**Uso via CLI:**
```bash
k6 run --env BASE_URL=http://production.com tests/k6/auth-flow.test.js
```

**Explicação:** O código acima está armazenado no arquivo `tests/k6/helpers/baseUrl.js` e demonstra o uso de **Variáveis de Ambiente**. A função lê a variável `__ENV.BASE_URL` que pode ser definida via linha de comando usando `--env BASE_URL=<valor>`. Se a variável não for fornecida, usa o valor padrão `http://localhost:3000`. Isso permite executar o mesmo teste em diferentes ambientes (desenvolvimento, staging, produção) sem alterar o código.

---

### 7. 📊 Stages

**Localização:** `tests/k6/auth-flow.test.js` (linhas 33-37)

Os **Stages** definem diferentes fases de carga durante a execução do teste.

```javascript
stages: [
  { duration: '5s', target: 10 },
  { duration: '20s', target: 10 },
  { duration: '5s', target: 0 },
],
```

**Explicação:** O código acima está armazenado no arquivo `tests/k6/auth-flow.test.js` e demonstra o uso de **Stages**. Configuramos o teste em 3 fases:
1. **Ramp-up** (5s): Aumenta gradualmente de 0 para 10 VUs (Virtual Users) - simula usuários entrando no sistema
2. **Plateau** (20s): Mantém 10 VUs constantes - teste de sustentação para avaliar estabilidade
3. **Ramp-down** (5s): Reduz gradualmente de 10 para 0 VUs - simula usuários saindo do sistema

---

### 8. 🔄 Reaproveitamento de Resposta

**Localização:** `tests/k6/auth-flow.test.js` (linhas 53-54 e 107-108)

O **Reaproveitamento** extrai dados de uma resposta HTTP para usar em requisições subsequentes.

**Exemplo 1 - Salvar credenciais (linhas 53-54):**
```javascript
const email = `${emailParts[0]}_${uniqueId}@${emailParts[1]}`;
const password = user.password;

registeredEmail = email;
registeredPassword = password;
```

**Exemplo 2 - Extrair token JWT (linhas 107-108):**
```javascript
if (response.status === 200) {
  token = response.json('token');
}
```

**Explicação:** O código acima está armazenado no arquivo `tests/k6/auth-flow.test.js` e demonstra o uso de **Reaproveitamento de Resposta**. Primeiro, armazenamos as credenciais do usuário registrado em variáveis (`registeredEmail` e `registeredPassword`) para reutilizá-las no login. Depois, extraímos o token JWT da resposta do endpoint de login usando `response.json('token')` e o armazenamos na variável `token` para utilizá-lo em requisições autenticadas subsequentes. Isso simula o fluxo real de um usuário.

---

### 9. 🔐 Uso de Token de Autenticação (JWT)

**Localização:** `tests/k6/auth-flow.test.js` (linhas 113-118)

O **Token JWT** é usado para autenticar requisições a endpoints protegidos.

```javascript
if (token) {
  group('Get User Data with JSON Data', function () {
    const params = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
```

**Explicação:** O código acima está armazenado no arquivo `tests/k6/auth-flow.test.js` e demonstra o uso de **Token de Autenticação JWT**. Após extrair o token da resposta de login, verificamos se ele existe e o incluímos no header `Authorization` com o prefixo `Bearer` conforme o padrão JWT. Este token autentica a requisição GET ao endpoint `/api/users` que é protegido e requer autenticação. Isso valida o fluxo completo de autenticação da API.

---

### 10. 📂 Data-Driven Testing

**Localização:** `tests/k6/auth-flow.test.js` (linhas 17-19 e linha 45)

O **Data-Driven Testing** utiliza dados de um arquivo externo para parametrizar os testes.

**Carregamento dos dados (linhas 17-19):**
```javascript
const users = new SharedArray('users', function () {
  return JSON.parse(open('./data/users.json'));
})
```

**Distribuição dos dados (linha 45):**
```javascript
const user = users[(__VU - 1) % users.length];
```

**Explicação:** O código acima está armazenado no arquivo `tests/k6/auth-flow.test.js` e demonstra o uso de **Data-Driven Testing**. Utilizamos `SharedArray` para carregar dados do arquivo `tests/k6/data/users.json` de forma eficiente na memória (compartilhado entre todos os VUs). Cada Virtual User (VU) recebe um usuário diferente usando a fórmula `(__VU - 1) % users.length`, que distribui os usuários de forma circular. Por exemplo, com 10 usuários no arquivo, o VU 1 pega o usuário índice 0, VU 2 pega índice 1, e assim por diante.

---

### 11. 📦 Groups

**Localização:** `tests/k6/auth-flow.test.js` (linhas 40, 47 e 136)

Os **Groups** organizam testes em blocos lógicos para análise estruturada de métricas.

**Grupo Principal - Data-Driven (linha 40):**
```javascript
group('01 - Data-Driven Testing (JSON File)', function () {
  let token = null;
  let registeredEmail = null;
  let registeredPassword = null;

  const user = users[(__VU - 1) % users.length];

  group('Register User with JSON Data', function () {
```

**Grupo Principal - Faker (linha 136):**
```javascript
group('02 - Faker.js Generated Data', function () {
  let token = null;
  let registeredEmail = null;
  let registeredPassword = null;

  group('Register User with Faker Data', function () {
```

**Explicação:** O código acima está armazenado no arquivo `tests/k6/auth-flow.test.js` e demonstra o uso de **Groups**. Organizamos o teste em 2 grupos principais (01 - Data-Driven e 02 - Faker), cada um contendo 3 sub-grupos (Register, Login, Get User). Os groups permitem que o K6 agregue métricas separadamente para cada seção, facilitando a identificação de gargalos específicos. Por exemplo, podemos comparar se o registro com dados do JSON é mais rápido que com Faker, ou qual endpoint é o mais lento.

---

## 📁 Estrutura do Projeto

```
tests/k6/
├── auth-flow.test.js          # ⭐ Teste principal com todos os conceitos
├── helpers/
│   ├── baseUrl.js             # 🔧 Helper de URL (Variável de Ambiente)
│   └── auth.js                # 🔐 Helper de autenticação (opcional)
└── data/
    └── users.json             # 📊 Dados para Data-Driven Testing

generate-test-data.js          # 🎲 Script de geração de dados com Faker.js
package.json                   # 📦 Dependências e scripts do projeto
```

---

## 📊 Resultados e Métricas

### Métricas Coletadas

#### Métricas Padrão do K6
- `http_req_duration` - Duração total das requisições HTTP
- `http_req_failed` - Taxa de falha de requisições
- `http_reqs` - Total de requisições realizadas
- `iterations` - Número de iterações completas
- `vus` - Número de usuários virtuais ativos

#### Métricas Customizadas (Trends) - Data-Driven Testing
- `register_duration` - Tempo do endpoint de registro (JSON)
- `login_duration` - Tempo do endpoint de login (JSON)
- `getuser_duration` - Tempo de consulta de dados (JSON)

#### Métricas Customizadas (Trends) - Faker
- `faker_register_duration` - Tempo do endpoint de registro (Faker)
- `faker_login_duration` - Tempo do endpoint de login (Faker)
- `faker_getuser_duration` - Tempo de consulta de dados (Faker)

### Critérios de Sucesso (Thresholds)

| Métrica | Threshold | Descrição |
|---------|-----------|-----------|
| `http_req_duration` | p(95) < 2000ms | 95% das requisições devem responder em menos de 2s |
| `register_duration` | p(95) < 3000ms | 95% dos registros (JSON) < 3s |
| `login_duration` | p(95) < 2000ms | 95% dos logins (JSON) < 2s |
| `getuser_duration` | p(95) < 1000ms | 95% das consultas (JSON) < 1s |
| `faker_register_duration` | p(95) < 3000ms | 95% dos registros (Faker) < 3s |
| `faker_login_duration` | p(95) < 2000ms | 95% dos logins (Faker) < 2s |
| `faker_getuser_duration` | p(95) < 1000ms | 95% das consultas (Faker) < 1s |
| `checks` | rate > 0.80 | Pelo menos 80% dos checks devem passar |

### Exemplo de Output

```
✓ Register status is 201
✓ Login status is 200
✓ Get user status is 200

checks.........................: 100.00% ✓ 600     ✗ 0   
http_req_duration..............: avg=145ms min=12ms med=98ms  max=892ms p(90)=387ms p(95)=521ms
register_duration..............: avg=187ms min=45ms med=152ms max=654ms p(90)=298ms p(95)=412ms
login_duration.................: avg=98ms  min=21ms med=76ms  max=321ms p(90)=178ms p(95)=234ms
getuser_duration...............: avg=76ms  min=12ms med=58ms  max=256ms p(90)=143ms p(95)=189ms
faker_register_duration........: avg=192ms min=48ms med=159ms max=678ms p(90)=305ms p(95)=421ms
faker_login_duration...........: avg=102ms min=23ms med=79ms  max=334ms p(90)=184ms p(95)=241ms
faker_getuser_duration.........: avg=79ms  min=14ms med=61ms  max=267ms p(90)=148ms p(95)=196ms
http_reqs......................: 300     10/s
iterations.....................: 100     3.33/s
vus............................: 10      min=0     max=10
```

---

## 📚 Referências

- [Documentação Oficial K6](https://k6.io/docs/)
- [xk6-faker Extension](https://github.com/szkiba/xk6-faker)
- [K6 Extensions](https://k6.io/docs/extensions/)
- [Faker.js Documentation](https://fakerjs.dev/)

---

## 👨‍💻 Autor

**João Vitor dos Santos** (QAkarotto - Goku)

- GitHub: [@QAkarotto](https://github.com/QAkarotto)
- Projeto: Trabalho Final - PGATS Performance Testing
- Instituição: Pós-Graduação em Automação de Testes de Software
- Disciplina: Automação de Testes de Performance

---

<div align="center">

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**

</div>



