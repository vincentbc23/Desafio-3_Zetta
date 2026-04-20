# Desafio-3_Zetta

### Link para baixar as bases de dados todas a partir do drive: https://drive.google.com/file/d/1RTIoVEAFcfYmQG6E2xWhSWW4OCr2qIPw/view?usp=sharing
### Link para o dataSet tratado [https://drive.google.com/file/d/1O60kdBVA6pilZks8iJ3SUuKN9i1qcToL/view?usp=sharing](https://drive.google.com/file/d/1yiJCGHGb7wu5kibPlBWYO5RENWN3rOY3/view?usp=sharing)
### A base de dados mais importante é a base final: bdqueimadas_final.csv, mas as que formaram como está no Jupyter Notebook estão ai também.

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

