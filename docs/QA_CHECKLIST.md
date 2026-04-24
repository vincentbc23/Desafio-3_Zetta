# QA Checklist — Fluxo real (Frontend + Backend + DB)

Checklist manual para validar o fluxo completo com dados reais:

- Reporte (`/reportar`)
- Persistência no banco
- Atualização de dashboards (`/`, `/dados`, `/mapa`)
- Atualização da área privada de órgãos (`/painel`, `/orgaos`)
- Exibição na tela de sucesso (`/sucesso`)

## 1) Pré-requisitos

- Backend em execução na porta `5000`.
- Frontend em execução (Vite local `5173` ou Nginx `8080`).
- PostgreSQL acessível pelo backend.

Comandos (raiz do projeto):

```bash
npm run dev:backend
npm run dev:frontend
```

ou:

```bash
npm run dev:full
```

## 2) Smoke test de API (rápido)

### 2.1 Health

```bash
curl -s http://localhost:5000/api/health
```

Esperado:
- `ok: true`
- status HTTP `200`

### 2.2 Reportar (ingestão principal)

```bash
curl -s -X POST http://localhost:5000/api/reportar \
  -H 'Content-Type: application/json' \
  -d '{"latitude":-15.793889,"longitude":-47.882778}'
```

Esperado:
- status HTTP `201`
- campos `reportId`, `features`, `ml`
- `features` contendo os 9 atributos do modelo
- `ml` contendo `status`, `classePrevista`, `probIncendio`

### 2.3 Dashboards

```bash
curl -s http://localhost:5000/api/cards
curl -s http://localhost:5000/api/dados
```

Esperado em `/api/cards`:
- `totals.totalReports` incrementado
- `cards` com valores atualizados

Esperado em `/api/dados`:
- `resumo.totalIncendios` incrementado
- `ultimosReportes` com o novo `reportId`

### 2.4 Login de bombeiro + endpoint privado

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"bombeiro@alertafogo.gov.br","senha":"Bombeiro@123"}' | jq -r '.token')

curl -s http://localhost:5000/api/orgaos/analytics \
  -H "Authorization: Bearer $TOKEN"
```

Esperado em `/api/orgaos/analytics`:
- status HTTP `200` com `resumo`, `graficos` e `ultimosReportes`
- sem token (ou token inválido) retorna `401`

## 3) Fluxo de UI ponta a ponta

### 3.1 Reportar

1. Acesse `/reportar`.
2. Clique em `GPS` para capturar localização.
3. Envie o formulário.

Esperado:
- sem erro visual
- atributos climáticos exibidos
- navegação automática para `/sucesso`

### 3.2 Sucesso

Esperado:
- mostra `reportId` real
- mostra coordenadas reais
- mostra predição real (`classe` e probabilidade)
- mostra informações do modelo (`modelName`, `modelVersion`, `source`)

### 3.3 Home

Acesse `/`.

Esperado:
- cards com valores reais de `/api/cards`
- botão `Atualizar agora` funcional
- timestamp de atualização visível

### 3.4 Dados

Acesse `/dados`.

Esperado:
- cards e gráficos baseados em `/api/dados`
- botão `Atualizar agora` funcional
- timestamp de atualização visível

### 3.5 Mapa

Acesse `/mapa`.

Esperado:
- marcadores reais vindos de `ultimosReportes`
- filtros de data/região funcionando
- popup com `probIncendio`, `frpPrevisto` e horário
- botão `Atualizar agora` funcional

### 3.6 Área privada de órgãos

1. Acesse `/login` com usuário bombeiro.
2. Entre no `/painel` e clique em `Análise de Órgãos`.

Esperado:
- rota `/orgaos` carrega apenas com sessão válida
- gráficos da análise aparecem com dados reais
- tabela de últimos reportes mostra detalhes meteorológicos e predição
- botão `Atualizar` recarrega sem perder sessão

## 4) Polling automático (30s por padrão)

Configuração em `frontend/.env.local`:

```env
VITE_API_REFRESH_MS=30000
```

Esperado:
- páginas `/`, `/dados`, `/mapa` atualizam automaticamente
- polling pausa com aba em background
- polling retoma ao voltar foco

## 5) Regressão de compatibilidade

Validar endpoint legado:

```bash
curl -s -X POST http://localhost:5000/api/reports/ingest \
  -H 'Content-Type: application/json' \
  -d '{"latitude":-15.793889,"longitude":-47.882778}'
```

Esperado:
- comportamento equivalente ao `POST /api/reportar`

## 6) Critérios de aceite da release

- [ ] `GET /api/health` retorna `200`.
- [ ] `POST /api/reportar` retorna `201` com payload completo.
- [ ] `GET /api/cards` e `GET /api/dados` refletem novos reportes.
- [ ] `GET /api/orgaos/analytics` responde `200` com token válido e `401` sem token.
- [ ] Tela `/sucesso` exibe dados reais do reporte.
- [ ] Home/Dados/Mapa atualizam manualmente e por polling.
- [ ] `/orgaos` só abre para sessão válida de bombeiro.
- [ ] Sem erros no build do frontend (`npm --prefix frontend run build`).
