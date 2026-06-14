import pandas as pd
import joblib
import scipy.sparse

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer


def preprocess_data(input_path: str):
    print("Starting preprocessing...")

    # Load dataset
    df = pd.read_csv(input_path)

    # Keep only required columns (safety check)
    df = df[["Subject", "Spam"]]

    # Handle missing values
    df.dropna(inplace=True)

    # Convert target variable
    df["Spam"] = df["Spam"].map({
        "Yes": 1,
        "No": 0
    })

    # Features and labels
    X = df["Subject"]
    y = df["Spam"]

    # TF-IDF vectorization (TEXT → NUMERIC FEATURES)
    vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
    X_vectorized = vectorizer.fit_transform(X)

    # Save vectorizer (VERY IMPORTANT for inference)
    joblib.dump(vectorizer, "ml/models/vectorizer.pkl")

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_vectorized,
        y,
        test_size=0.2,
        random_state=42
    )

    # Save sparse matrices (efficient for TF-IDF)
    scipy.sparse.save_npz("ml/data/processed/X_train.npz", X_train)
    scipy.sparse.save_npz("ml/data/processed/X_test.npz", X_test)

    # Save labels
    y_train.to_csv("ml/data/processed/y_train.csv", index=False)
    y_test.to_csv("ml/data/processed/y_test.csv", index=False)

    print("Preprocessing completed successfully!")

    return X_train, X_test, y_train, y_test


if __name__ == "__main__":
    preprocess_data("ml/data/raw/spam_mail_contetn.csv")