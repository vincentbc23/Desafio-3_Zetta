# Predição de Incêndios Florestais no Cerrado Mineiro

Este repositório contém um pipeline completo de *Data Science* e *Machine Learning* desenvolvido para prever o risco e a intensidade de incêndios florestais no bioma Cerrado, com foco no estado de Minas Gerais. 

O sistema integra dados históricos de focos de calor do INPE com variáveis meteorológicas da API ERA5 (Copernicus), permitindo uma análise profunda desde a limpeza dos dados até a explicabilidade dos modelos preditivos.

## Estrutura do Projeto

O projeto está dividido em notebooks que seguem o fluxo lógico:

### 1. `Limpeza_dadosMinas.ipynb` (ETL e Pré-processamento)
* Extração da base histórica do BdQueimadas (INPE).
* Triangulação e cruzamento temporal/espacial com dados climáticos da API ERA5.
* Verificação de padronização e imputação de valores nulos utilizando a biblioteca Scikit-Learn (`HistGradientBoostingRegressor`).

### 2. `eda_cerrado_mineiro.ipynb` (Análise Geoespacial)
* Foco na distribuição geográfica dos focos de incêndio por municípios mineiros.
* Integração com arquivos de malha territorial (Shapefiles) utilizando `Geopandas`.
* Geração de mapas de densidade (*Choropleth maps*), identificando visualmente as regiões mais críticas do estado.

### 3. `graficos.ipynb` (Séries Temporais e Anomalias)
* Geração de gráficos interativos utilizando `Plotly`.
* Análise de tendências temporais e identificação de anos com desvios/anomalias extremas em relação à média histórica.

### 4. `modelo_preditivo.ipynb` (Classificador de Risco de Fogo)
* Análise exploratória inicial (via Matplotlib/Seaborn) para identificação de outliers na variável `RiscoFogo` e separação das classes de risco (alto >= 0.8 e baixo < 0.8).
* **Tratamento de Dados:** Aplicação do *Clipping* (limite de 120 dias) na variável `DiaSemChuva` para padronizar o aprendizado sobre o estresse hídrico da vegetação.
* Algoritmo: **XGBoost Classifier** (otimizado com *Grid Search*).
* **Otimização de Limiar (Threshold):** Ajuste estratégico do ponto de decisão de `0.50` para `0.15`, priorizando a sensibilidade do sistema para atuar como um "alerta precoce" eficiente na detecção de fogo.
* Explicabilidade do modelo revelada através de gráficos **SHAP Values**.

### 5. `modelo_preditivo_FRP.ipynb` (Regressor de Intensidade)
* Análise exploratória focada na extrema "cauda longa" da variável alvo **FRP** (*Fire Radiative Power* em Megawatts).
* Aplicação de filtros físicos de segurança (corte no percentil 95 para FRP extremo e *Clipping* limitando os "Dias Sem Chuva" a 120 dias).
* Algoritmo: **XGBoost Regressor** (otimizado com *RandomizedSearchCV*).
* Validação da "física do fogo" via **SHAP Values**, que confirmou variáveis como `Hora` (ciclo diurno) e `Temperatura_C` como os principais motores da fúria do incêndio.

---

## Conjunto de Dados (Dataset)

Os dados utilizados neste projeto estão disponíveis nos links abaixo. A base final consolidada é o arquivo `bdqueimadas_final.csv`.

* [**Bases de Dados Originais (Drive)**](https://drive.google.com/file/d/1RTIoVEAFcfYmQG6E2xWhSWW4OCr2qIPw/view?usp=sharing) - Contém os arquivos brutos ano a ano que alimentaram o processo.
* [**Dataset Tratado e Final (Drive)**](https://drive.google.com/file/d/1O60kdBVA6pilZks8iJ3SUuKN9i1qcToL/view?usp=sharing) - Base pronta para uso nos modelos e gráficos.

---

## Tecnologias Utilizadas

* **Linguagem:** Python
* **Processamento de Dados:** Pandas, NumPy, Geopandas
* **Visualização:** Matplotlib, Seaborn, Plotly
* **Machine Learning:** Scikit-Learn, XGBoost
* **Explicabilidade de IA:** SHAP
* **Deploy/Serialização:** Joblib

## Como Executar

1. Clone o repositório.
2. Baixe os datasets nos links acima e coloque-os na pasta `dadosMinas/`.
3. Instale as dependências:
   ```bash
   pip install pandas numpy geopandas matplotlib seaborn plotly scikit-learn xgboost shap joblib

## API FastAPI para expor os modelos PKL

Foi adicionada uma API em `api/main.py` para servir os modelos em `ArquivosPkl/`:

- `classificador_fogo_cerrado.pkl`
- `regressor_intensidade_frp.pkl`
- `features_fogo.pkl`

### 1) Instalar dependencias

```bash
pip install -r requirements-api.txt
```

### 2) Executar a API

```bash
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### 3) Endpoints disponiveis

- `GET /health`
- `GET /features`
- `POST /predict/classificacao`
- `POST /predict/frp`
- `POST /predict`

Documentacao interativa (Swagger): `http://localhost:8000/docs`

### 4) Formato do payload

O campo `features` pode ser enviado de duas formas:

1. Dicionario com nome da feature e valor
2. Lista de valores na ordem de `GET /features`

Exemplo com dicionario:

```json
{
	"features": {
		"feature_1": 0.12,
		"feature_2": 7.5
	}
}
```

Exemplo com lista:

```json
{
	"features": [0.12, 7.5, 1.1]
}
```

### 5) CORS

Por padrao, a API aceita todas as origens. Para restringir, use a variavel de ambiente `ALLOWED_ORIGINS`:

```bash
export ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

