# Frontend preparado para Node.js + Express

## Estrutura criada

- `frontend/src/app/api/config.ts` — configuração base da API
- `frontend/src/app/api/client.ts` — cliente HTTP centralizado
- `frontend/src/app/api/useApi.ts` — hook de consumo com loading/erro
- `frontend/.env.example` / `frontend/.env.local` — variáveis do frontend
- `frontend/vite.config.ts` — proxy de desenvolvimento para `/api`

## Variáveis de ambiente

Use em `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000
VITE_ENV=development
```

## Uso rápido

- GET: `api.get('/api/cards')`
- POST: `api.post('/api/reports', payload)`
- Hook: `useApi('/api/cards')`

## Quando iniciar o backend

1. Suba o backend na porta `5000`
2. Exponha rotas com prefixo `/api`
3. Execute o frontend com `npm run dev:frontend` (pela raiz) ou `npm run dev` dentro de `frontend/`

Durante desenvolvimento, o Vite faz proxy de `/api/*` para `http://localhost:5000`.

## Configuração inicial do backend

### Estrutura base

- `backend/src/app.js` — bootstrap do Express (helmet, cors, json, morgan, rotas, erros)
- `backend/src/server.js` — inicialização do servidor HTTP e graceful shutdown
- `backend/src/routes/index.js` — roteador principal da API
- `backend/src/modules/health/` — módulo inicial de healthcheck
- `backend/src/shared/config/env.js` — leitura e normalização de variáveis de ambiente
- `backend/src/shared/config/cors.js` — opções de CORS centralizadas
- `backend/src/shared/config/logger.js` — formato de logs HTTP
- `backend/src/shared/config/constants.js` — constantes do backend (`API_PREFIX`, limite JSON)
- `backend/src/shared/middlewares/` — middlewares globais (`notFound`, `errorHandler`)

### Variáveis de ambiente do backend

Use como base `backend/.env.example`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

`FRONTEND_URL` também aceita múltiplas origens separadas por vírgula.

### Como iniciar o backend

Pela raiz do workspace:

```bash
npm run dev:backend
```

Ou diretamente na pasta `backend/`:

```bash
npm run dev
```
