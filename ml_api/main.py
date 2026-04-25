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
    
    regressor = joblib.load(os.path.join(MODELS_DIR, "regressor_intensidade_frp.pkl"))
  
    colunas_esperadas = joblib.load(os.path.join(MODELS_DIR, "features_fogo.pkl")) 
except Exception as e:
    print(f"Erro ao carregar os modelos: {e}")

class IngestaoDados(BaseModel):
    dados: Dict[str, float]  # Ex: {"temperatura": 32.5, "umidade": 15.0, "lat": -15.0, ...}

@app.post("/predict")
def predict_fogo(payload: IngestaoDados):
    try:
        # Transforma o dicionário em uma linha de DataFrame
        df_input = pd.DataFrame([payload.dados])
        
        # Garante que o DataFrame tem as colunas na exata ordem que o modelo espera
        # Se faltar alguma coluna, o Pandas preenche com NaN 
        df_input = df_input.reindex(columns=colunas_esperadas, fill_value=0)
        
        # Executa as predições
        pred_class = classificador.predict(df_input)[0]
        pred_frp = regressor.predict(df_input)[0]
        prob_incendio = None

        # Se o modelo suportar probabilidades, retorna também uma "probabilidade de incêndio".
        # - Binário: usa a probabilidade da classe 1 (se existir).
        # - Multiclasse: usa a probabilidade máxima (confiança da predição).
        if hasattr(classificador, "predict_proba"):
            proba = classificador.predict_proba(df_input)[0]
            classes = list(getattr(classificador, "classes_", []))

            if len(proba) > 0:
                if 1 in classes:
                    prob_incendio = float(proba[classes.index(1)])
                else:
                    prob_incendio = float(max(proba))

        # Executa as predições
        print(">> [API] Dados recebidos. Repassando para o modelo...")
        print(f">> [API] Features de entrada: \n{df_input.to_string()}")
        
        pred_class = classificador.predict(df_input)[0]
        pred_frp = regressor.predict(df_input)[0]
        
        print(f">> [MODELO] Predição concluída! Classe: {pred_class} | FRP: {pred_frp}")
        
        return {
            "status": "sucesso",
            "prob_incendio": prob_incendio,
            "classificacao_fogo": int(pred_class),
            "intensidade_frp": float(pred_frp)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro no processamento: {str(e)}")