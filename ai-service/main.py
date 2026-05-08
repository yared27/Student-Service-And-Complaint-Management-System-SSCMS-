from pathlib import Path
from threading import Lock

import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.metrics.pairwise import cosine_similarity

from train import train_pipeline

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
DUPLICATE_THRESHOLD = 0.7


class PredictRequest(BaseModel):
    text: str


class PredictResponse(BaseModel):
    # Only return priority and duplicate_score per new contract
    priority: str
    duplicate_score: float


app = FastAPI(title="SSCMS AI Advisory Service", version="1.0.0")
_model_lock = Lock()
_model_bundle = {}


def _load_models() -> dict:
    required = [
        MODELS_DIR / "vectorizer.pkl",
        MODELS_DIR / "type_model.pkl",
        MODELS_DIR / "category_model.pkl",
        MODELS_DIR / "priority_model.pkl",
        MODELS_DIR / "tfidf_matrix.pkl",
        MODELS_DIR / "reference_texts.pkl",
    ]

    if not all(path.exists() for path in required):
        train_pipeline()

    return {
        "vectorizer": joblib.load(MODELS_DIR / "vectorizer.pkl"),
        "type_model": joblib.load(MODELS_DIR / "type_model.pkl"),
        "category_model": joblib.load(MODELS_DIR / "category_model.pkl"),
        "priority_model": joblib.load(MODELS_DIR / "priority_model.pkl"),
        "tfidf_matrix": joblib.load(MODELS_DIR / "tfidf_matrix.pkl"),
        "reference_texts": joblib.load(MODELS_DIR / "reference_texts.pkl"),
    }


def _ensure_models() -> dict:
    global _model_bundle
    with _model_lock:
        if not _model_bundle:
            _model_bundle = _load_models()
    return _model_bundle


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest) -> PredictResponse:
    text = str(payload.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    models = _ensure_models()
    vectorizer = models["vectorizer"]

    vector = vectorizer.transform([text])

    # We only predict priority and compute duplicate score.
    predicted_priority = models["priority_model"].predict(vector)[0]

    similarities = cosine_similarity(vector, models["tfidf_matrix"]).flatten()
    duplicate_score = float(similarities.max()) if similarities.size else 0.0

    return PredictResponse(
        priority=str(predicted_priority),
        duplicate_score=round(duplicate_score, 4),
    )


@app.post("/train")
def train() -> dict:
    global _model_bundle
    stats = train_pipeline()
    with _model_lock:
        _model_bundle = _load_models()
    return {
        "message": "Models retrained successfully.",
        "rows": stats["rows"],
    }
