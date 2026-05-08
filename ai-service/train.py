from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics.pairwise import cosine_similarity
import joblib

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset.csv"
MODELS_DIR = BASE_DIR / "models"

ALLOWED_TYPES = {"SERVICE", "COMPLAINT"}
ALLOWED_CATEGORIES = {
    "ICT",
    "DORMITORY",
    "CAFETERIA",
    "CLASSROOM",
    "LIBRARY",
    "LABORATORY",
    "UTILITIES",
    "TRANSPORT",
}
ALLOWED_PRIORITIES = {"LOW", "MEDIUM", "HIGH"}


def _normalize(value: str) -> str:
    return str(value or "").strip().upper()


def load_dataset(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")

    df = pd.read_csv(path)
    required_columns = {"text", "type", "category", "priority"}
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        raise ValueError(f"dataset.csv is missing columns: {', '.join(sorted(missing_columns))}")

    df = df[["text", "type", "category", "priority"]].copy()
    df["text"] = df["text"].astype(str).str.strip()
    df["type"] = df["type"].map(_normalize)
    df["category"] = df["category"].map(_normalize)
    df["priority"] = df["priority"].map(_normalize)

    df = df[df["text"] != ""]
    df = df[df["type"].isin(ALLOWED_TYPES)]
    df = df[df["category"].isin(ALLOWED_CATEGORIES)]
    df = df[df["priority"].isin(ALLOWED_PRIORITIES)]

    if df.empty:
        raise ValueError("No valid rows in dataset.csv after normalization/filtering.")

    return df.reset_index(drop=True)


def train_pipeline(dataset_path: Path = DATASET_PATH, models_dir: Path = MODELS_DIR) -> dict:
    df = load_dataset(dataset_path)

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), lowercase=True)
    x = vectorizer.fit_transform(df["text"])

    type_model = LogisticRegression(max_iter=1200)
    category_model = LogisticRegression(max_iter=1200)
    priority_model = LogisticRegression(max_iter=1200)

    type_model.fit(x, df["type"])
    category_model.fit(x, df["category"])
    priority_model.fit(x, df["priority"])

    models_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(vectorizer, models_dir / "vectorizer.pkl")
    joblib.dump(type_model, models_dir / "type_model.pkl")
    joblib.dump(category_model, models_dir / "category_model.pkl")
    joblib.dump(priority_model, models_dir / "priority_model.pkl")

    # Keep the fitted matrix + source text for duplicate detection.
    joblib.dump(x, models_dir / "tfidf_matrix.pkl")
    joblib.dump(df["text"].tolist(), models_dir / "reference_texts.pkl")

    return {
        "rows": int(df.shape[0]),
        "models_dir": str(models_dir),
    }


if __name__ == "__main__":
    stats = train_pipeline()
    print(f"Training completed. Rows: {stats['rows']}. Models saved to: {stats['models_dir']}")
