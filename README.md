
# D3 Zetta

Plataforma full stack para monitoramento e reporte de incêndios, com ingestão georreferenciada, coleta automática de clima, predição de FRP por modelo de ML e dashboards operacionais para análise.

## Visão geral

O sistema possui três aplicações principais:

1. `frontend` (React + Vite + TypeScript): interface para reporte, painel operacional, mapas e análises.
2. `backend` (Node.js + Express + PostgreSQL): API principal, autenticação, ingestão, consultas analíticas e integração com ML.
3. `ml_api` (FastAPI + scikit-learn): serviço de predição de classe e intensidade FRP.

## Arquitetura

1. Usuário envia reporte com coordenadas (`/api/reportar` ou `/api/reports/ingest`).
2. Backend coleta features meteorológicas (Open-Meteo) e monta payload do modelo.
3. Backend chama `ml_api` para obter predição.
4. Backend persiste dados em `reports`, `weather_features` e `predictions`.
5. Frontend consome endpoints de leitura (`/api/cards`, `/api/dados`, `/api/orgaos/analytics`) para renderizar os dashboards.

## Regra oficial de classificação por FRP

A classificação de risco utilizada na aplicação segue a intensidade FRP prevista:

1. `FRP < 50` -> `baixo`/`leve`
2. `50 <= FRP <= 500` -> `moderado`
3. `FRP > 500` -> `alto`

Essa regra é aplicada no serviço de ML do backend e refletida nos dados consumidos pelas telas.

## Tecnologias

- Frontend: React 18, Vite 6, TypeScript, Recharts, Leaflet, Motion
- Backend: Node.js, Express, pg, dotenv, cors, helmet
- ML API: FastAPI, pandas, scikit-learn, xgboost, joblib
- Banco: PostgreSQL 16
- Infra: Docker + Docker Compose

## Estrutura do projeto

```text
.
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── data/
│   │   │   ├── health/
│   │   │   ├── ml/
│   │   │   └── reports/
│   │   ├── routes/
│   │   └── shared/
├── frontend/
│   ├── src/app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── components/
│   │   └── pages/
├── ml_api/
├── graficos/
├── docs/
├── docker-compose.yml
└── package.json
```

## Pré-requisitos

- Node.js 18+
- npm 9+
- Docker e Docker Compose (opcional, recomendado para ambiente completo)

## Execução local (sem Docker)

### 1) Instalar dependências

Na raiz:

```bash
npm install
```

No frontend:

```bash
cd frontend && npm install
```

No backend:

```bash
cd ../backend && npm install
```

No serviço de ML:

```bash
cd ../ml_api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2) Configurar variáveis de ambiente

Backend:

```bash
cp backend/.env.example backend/.env
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

### 3) Subir os serviços

Na raiz, frontend + backend:

```bash
npm run dev:full
```

Ou separadamente:

```bash
npm run dev:frontend
npm run dev:backend
```

Para subir a API de ML localmente:

```bash
cd ml_api
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Execução com Docker

Subir toda a stack:

```bash
docker compose up --build -d
```

Parar containers:

```bash
docker compose down
```

Serviços expostos:

1. Frontend: `http://localhost:8080`
2. Backend: `http://localhost:5000`
3. ML API: `http://localhost:8000`
4. PostgreSQL: `localhost:5432`

## Variáveis de ambiente

### Backend (`backend/.env`)

Principais variáveis:

- `PORT` (padrão `5000`)
- `NODE_ENV`
- `FRONTEND_URL` (aceita lista separada por vírgula)
- `DATABASE_URL`
- `WEATHER_API_BASE_URL`
- `WEATHER_ARCHIVE_BASE_URL`
- `ML_API_URL`
- `ML_ENABLED`

### Frontend (`frontend/.env`)

- `VITE_API_URL` (exemplo: `http://localhost:5000`)
- `VITE_API_REFRESH_MS` (polling de telas como Home, Dados e Mapa)

## Rotas principais da API

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Reports / Ingestão

- `POST /api/reportar`
- `POST /api/reports/ingest`
- `POST /api/reports`

Payload típico:

```json
{
  "latitude": -16.3578,
  "longitude": -46.9064,
  "description": "Fumaça intensa próxima à vegetação"
}
```

### Dados e dashboards

- `GET /api/cards`
- `GET /api/dados`
- `GET /api/orgaos/analytics` (rota protegida para perfil bombeiro)

### ML

- `GET /api/ml/status`
- `POST /api/ml/predict`

## Scripts úteis

Na raiz:

- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run dev:full`
- `npm run build:frontend`

No backend:

- `npm run dev`
- `npm start`

No frontend:

- `npm run dev`
- `npm run build`
- `npm run preview`

## Troubleshooting rápido

1. `404` em chamadas `/api/*` no frontend:
	- Verifique `VITE_API_URL` e se o backend está em execução.

2. Falha na predição:
	- Confirme `ML_ENABLED=true` no backend.
	- Verifique se a `ml_api` está ativa em `ML_API_URL`.

3. Banco não conecta:
	- Confirme `DATABASE_URL`.
	- Em Docker, use host `postgres` dentro da rede de containers.

4. Gráficos/tipos inconsistentes:
	- Verifique se o backend está aplicando classificação por FRP nas consultas de dados.

