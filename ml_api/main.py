# api para carregamento dos modelos e predição por meio de requisições HTTP com os aruqivos de modelo salvos em formato .pkl

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import joblib
import pandas as pd
import os

app = FastAPI(title="API de Predição - Fogo no Cerrado")

# Caminho absoluto para a pasta models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# 1. Carregando os modelos e as features
try:
    classificador = joblib.load(os.path.join(MODELS_DIR, "classificador_fogo_cerrado.pkl"))
    # Regressor utilizando possivelmente Random Forest ou XGBoost conforme sua modelagem
    regressor = joblib.load(os.path.join(MODELS_DIR, "regressor_intensidade_frp.pkl"))
    # O arquivo de features geralmente é uma lista com os nomes das colunas esperadas
    colunas_esperadas = joblib.load(os.path.join(MODELS_DIR, "features_fogo.pkl")) 
except Exception as e:
    print(f"Erro ao carregar os modelos: {e}")

# Como não sabemos exatamente todas as colunas de cabeça, 
# podemos aceitar um dicionário genérico e o Pandas resolve o mapeamento
class IngestaoDados(BaseModel):
    dados: Dict[str, float]  # Ex: {"temperatura": 32.5, "umidade": 15.0, "lat": -15.0, ...}

@app.post("/predict")
def predict_fogo(payload: IngestaoDados):
    try:
        # Transforma o dicionário em uma linha de DataFrame
        df_input = pd.DataFrame([payload.dados])
        
        # Garante que o DataFrame tem as colunas na exata ordem que o modelo espera
        # Se faltar alguma coluna, o Pandas preenche com NaN (ou você pode tratar antes)
        df_input = df_input.reindex(columns=colunas_esperadas, fill_value=0)
        
        # Executa as predições
        pred_class = classificador.predict(df_input)[0]
        pred_frp = regressor.predict(df_input)[0]

        # Executa as predições
        print(">> [API] Dados recebidos. Repassando para o modelo...")
        print(f">> [API] Features de entrada: \n{df_input.to_string()}")
        
        pred_class = classificador.predict(df_input)[0]
        pred_frp = regressor.predict(df_input)[0]
        
        print(f">> [MODELO] Predição concluída! Classe: {pred_class} | FRP: {pred_frp}")
        
        return {
            "status": "sucesso",
            "classificacao_fogo": int(pred_class),
            "intensidade_frp": float(pred_frp)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro no processamento: {str(e)}")