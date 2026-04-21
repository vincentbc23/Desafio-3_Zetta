
# D3 Zetta

Projeto com frontend em React + Vite + TypeScript e backend em Node.js + Express.

## Como rodar

1. Instale dependências da raiz (scripts de orquestração):

```bash
npm install
```

2. Instale dependências do frontend:

```bash
cd frontend && npm install
```

3. Instale dependências do backend:

```bash
cd ../backend && npm install
```

4. Volte para a raiz e execute frontend + backend:

```bash
cd ..
npm run dev:full
```

Ou rode separado:

```bash
npm run dev:frontend
npm run dev:backend
```

## Estrutura do projeto

```
.
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── App.tsx
│   │   │   └── routes.tsx
│   │   ├── assets/
│   │   ├── imports/
│   │   ├── styles/
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/
│   └── src/
│       ├── modules/
│       │   └── health/
│       │       ├── health.controller.js
│       │       └── health.routes.js
│       ├── routes/
│       │   └── index.js
│       ├── shared/
│       │   ├── config/
│       │   │   └── env.js
│       │   └── middlewares/
│       │       ├── errorHandler.js
│       │       └── notFound.js
│       ├── app.js
│       └── server.js
├── docs/
├── guidelines/
├── package.json
└── pnpm-workspace.yaml
```

## Documentação

- `docs/FRONTEND_BACKEND_SETUP.md`
- `docs/API_EXAMPLES.md`
- `docs/INGESTAO_CLIMA_ML_READY.md`

## Healthcheck backend

Com backend em execução:

```bash
curl http://localhost:5000/api/health
```

## Ingestão automática para modelo (clima + GPS)

- A tela de reporte agora envia apenas latitude/longitude.
- O backend coleta clima atual + histórico e monta os atributos do modelo.
- `DiaSemChuva` e calculado com janela de 15 dias.
- Os dados são persistidos no PostgreSQL.
- A integração com API de ML (PKL) ficou preparada, mas ainda desativada.

Endpoint principal:

```bash
POST http://localhost:5000/api/reports/ingest
```

Payload exemplo:

```json
{
	"latitude": -16.3578,
	"longitude": -46.9064
}
```

Status de prontidão para ML:

```bash
GET http://localhost:5000/api/ml/status
```

## Docker

### Subir a aplicação com Docker Compose

Na raiz do projeto:

```bash
docker compose up --build -d
```

Serviços expostos:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:5000`
- PostgreSQL: `localhost:5432`
- Healthcheck backend: `http://localhost:5000/api/health`

### Parar os containers

```bash
docker compose down
```

### Observações

- O frontend é buildado e servido por Nginx.
- O path `/api/*` no frontend é encaminhado internamente para o backend no Docker.
- Se quiser alterar origem permitida no CORS, ajuste `FRONTEND_URL` no `docker-compose.yml`.
  