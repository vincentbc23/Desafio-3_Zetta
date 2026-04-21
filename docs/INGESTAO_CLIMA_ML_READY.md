# Ingestao de dados climáticos e preparo para ML

Este documento descreve a nova ingestao automatica de dados para o modelo de incendio e como o projeto foi preparado para adicionar a API de ML com arquivos PKL no futuro.

## Objetivo

Substituir entrada manual de dados do usuario por coleta automatica baseada em geolocalizacao + API de clima, persistindo em PostgreSQL com os mesmos atributos esperados pelos modelos:

- DiaSemChuva
- Precipitacao
- Temperatura_C
- Umidade_Relativa_%
- Vento_ms
- Mes
- Hora
- Latitude
- Longitude

## Regra de DiaSemChuva

- Janela fixa de 15 dias.
- Fonte: historico diario de precipitacao da API de clima.
- Contagem: dias consecutivos sem chuva do dia atual para tras.
- Criterio de dia sem chuva: precipitacao < 1.0 mm.
- Resultado limitado entre 0 e 15.

## Fluxo implementado

1. Front captura latitude/longitude via GPS.
2. Front chama `POST /api/reports/ingest`.
3. Backend consulta clima atual e historico na Open-Meteo.
4. Backend calcula `DiaSemChuva` (15 dias) e monta os 9 atributos.
5. Backend grava `reports` + `weather_features` no PostgreSQL.
6. Backend cria registro em `predictions` com status pendente para ML futuro.
7. Front exibe os atributos coletados e conclui envio.

## Endpoints novos

- `POST /api/reports/ingest`
  - Entrada:
    - `latitude` (number)
    - `longitude` (number)
  - Saida:
    - `reportId`
    - `features` (9 atributos do modelo)
    - `ml.status = pending`

- `GET /api/ml/status`
  - Endpoint de readiness para a futura API de ML.

## Banco de dados

Schema criado automaticamente ao iniciar backend:

- `reports`
- `weather_features`
- `predictions`

A tabela `predictions` ja deixa o caminho pronto para receber inferencias de modelos PKL.

## Variaveis de ambiente

Backend (`backend/.env.example`):

- `DATABASE_URL`
- `WEATHER_API_BASE_URL`
- `WEATHER_ARCHIVE_BASE_URL`
- `ML_API_URL`
- `ML_ENABLED`

## Docker Compose

Agora inclui:

- `postgres` (persistencia relacional)
- `backend` (ingestao + clima)
- `frontend`

## Frontend alterado

Pagina `Reportar`:

- Remove campos manuais de descricao/intensidade para o pipeline do modelo.
- Mantem captura de localizacao por GPS.
- Envia apenas coordenadas para backend.
- Exibe os 9 atributos retornados pela ingestao.

## Caminho para adicionar API de ML com PKL

Quando os PKL estiverem disponiveis nesta branch:

1. Criar servico `ml-api` (FastAPI) em pasta dedicada.
2. Carregar PKLs no startup da API.
3. Implementar `POST /predict` recebendo os 9 atributos.
4. No backend, quando `ML_ENABLED=true`, chamar `ML_API_URL` apos salvar `weather_features`.
5. Atualizar `predictions` com `prob_incendio`, `classe_prevista` e `frp_previsto`.

## Observacoes

- A chave de API de clima nao e necessaria para Open-Meteo atualmente.
- Caso troque de provedor de clima, mantenha o mesmo contrato de atributos para preservar compatibilidade com os modelos.
