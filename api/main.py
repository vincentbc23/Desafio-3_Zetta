from __future__ import annotations

import os
import pickle
from pathlib import Path
from typing import Any, Dict, List, Union

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    features: Union[Dict[str, float], List[float]] = Field(
        ...,
        description="Pode ser um dicionario {nome_feature: valor} ou uma lista na ordem esperada pelo modelo.",
    )


class ModelsRegistry:
    def __init__(self, pkl_dir: Path) -> None:
        self.pkl_dir = pkl_dir
        self.classifier = self._load_pickle("classificador_fogo_cerrado.pkl")
        self.regressor = self._load_pickle("regressor_intensidade_frp.pkl")
        self.expected_features = self._normalize_features(self._load_pickle("features_fogo.pkl"))

    def _load_pickle(self, file_name: str) -> Any:
        path = self.pkl_dir / file_name
        if not path.exists():
            raise FileNotFoundError(f"Arquivo nao encontrado: {path}")

        with path.open("rb") as f:
            return pickle.load(f)

    @staticmethod
    def _normalize_features(raw_features: Any) -> List[str]:
        if isinstance(raw_features, pd.Index):
            return [str(col) for col in raw_features.tolist()]
        if isinstance(raw_features, np.ndarray):
            return [str(col) for col in raw_features.tolist()]
        if isinstance(raw_features, (list, tuple, set)):
            return [str(col) for col in raw_features]
        if isinstance(raw_features, pd.DataFrame):
            return [str(col) for col in raw_features.columns.tolist()]
        if isinstance(raw_features, dict):
            return [str(col) for col in raw_features.keys()]

        raise ValueError("Formato de features_fogo.pkl nao suportado.")

    def to_dataframe(self, payload: Union[Dict[str, float], List[float]]) -> pd.DataFrame:
        if isinstance(payload, list):
            if len(payload) != len(self.expected_features):
                raise HTTPException(
                    status_code=422,
                    detail=(
                        "Quantidade de features invalida para entrada em lista. "
                        f"Esperado={len(self.expected_features)}, recebido={len(payload)}"
                    ),
                )
            return pd.DataFrame([payload], columns=self.expected_features)

        missing = [feature for feature in self.expected_features if feature not in payload]
        if missing:
            raise HTTPException(
                status_code=422,
                detail={
                    "mensagem": "Features obrigatorias ausentes.",
                    "faltantes": missing,
                },
            )

        ordered_values = [payload[feature] for feature in self.expected_features]
        return pd.DataFrame([ordered_values], columns=self.expected_features)


app = FastAPI(
    title="Zetta Fire Models API",
    description="API para expor os modelos de classificacao de fogo e regressao de FRP.",
    version="1.0.0",
)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parents[1]
PKL_DIR = BASE_DIR / "ArquivosPkl"

try:
    registry = ModelsRegistry(PKL_DIR)
except Exception as exc:
    raise RuntimeError(f"Falha ao carregar modelos: {exc}") from exc


@app.get("/health")
def healthcheck() -> Dict[str, Any]:
    return {
        "status": "ok",
        "modelos": {
            "classificador": "classificador_fogo_cerrado.pkl",
            "regressor": "regressor_intensidade_frp.pkl",
            "features": len(registry.expected_features),
        },
    }


@app.get("/features")
def get_expected_features() -> Dict[str, Any]:
    return {
        "quantidade": len(registry.expected_features),
        "features": registry.expected_features,
    }


@app.post("/predict/classificacao")
def predict_classificacao(payload: PredictionRequest) -> Dict[str, Any]:
    data = registry.to_dataframe(payload.features)
    pred = registry.classifier.predict(data)

    response: Dict[str, Any] = {
        "prediction": int(pred[0]) if isinstance(pred[0], (np.integer, int)) else str(pred[0]),
    }

    if hasattr(registry.classifier, "predict_proba"):
        proba = registry.classifier.predict_proba(data)
        response["probabilities"] = [float(x) for x in proba[0].tolist()]

    return response


@app.post("/predict/frp")
def predict_frp(payload: PredictionRequest) -> Dict[str, Any]:
    data = registry.to_dataframe(payload.features)
    pred = registry.regressor.predict(data)
    return {"frp": float(pred[0])}


@app.post("/predict")
def predict_all(payload: PredictionRequest) -> Dict[str, Any]:
    data = registry.to_dataframe(payload.features)

    class_pred = registry.classifier.predict(data)
    frp_pred = registry.regressor.predict(data)

    result: Dict[str, Any] = {
        "classificacao": int(class_pred[0]) if isinstance(class_pred[0], (np.integer, int)) else str(class_pred[0]),
        "frp": float(frp_pred[0]),
    }

    if hasattr(registry.classifier, "predict_proba"):
        proba = registry.classifier.predict_proba(data)
        result["probabilidades"] = [float(x) for x in proba[0].tolist()]

    return result
