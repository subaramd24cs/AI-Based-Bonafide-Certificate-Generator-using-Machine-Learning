import os
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.neural_network import MLPClassifier

# Try importing TensorFlow / Keras
try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Dense, Dropout, Input
    from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
    HAS_KERAS = True
except ImportError:
    HAS_KERAS = False

# Try importing Matplotlib / Seaborn
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import seaborn as sns
    HAS_PLOTTING = True
except ImportError:
    HAS_PLOTTING = False

def train_neural_network_model():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(script_dir, 'dataset.csv')

    if not os.path.exists(dataset_path):
        print("Dataset not found. Generating 20,000 synthetic student application records...")
        from generate_dataset import generate_dataset
        generate_dataset(20000, dataset_path)

    print(f"Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)

    # 1. Clean data
    df = df.dropna()

    numerical_cols = ['attendance_percentage', 'cgpa', 'semester', 'previous_bonafide_count']
    categorical_cols = [
        'fee_status', 'academic_status', 'application_purpose',
        'previous_application_status', 'disciplinary_status', 'course', 'department'
    ]

    # Target Encoding
    y_raw = df['result']
    target_encoder = LabelEncoder()
    y = target_encoder.fit_transform(y_raw)

    target_mapping = {cls: idx for idx, cls in enumerate(target_encoder.classes_)}
    print("Target classes mapping:", target_mapping)

    # Categorical Features Encoding
    encoders = {'target_encoder': target_encoder}
    X_encoded_cats = []

    for col in categorical_cols:
        le = LabelEncoder()
        df[col + '_encoded'] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        X_encoded_cats.append(col + '_encoded')

    # Feature matrix
    feature_cols = numerical_cols + X_encoded_cats
    X_matrix = df[feature_cols].values

    # Scaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_matrix)

    # Train-test split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"Training shape: {X_train.shape}, Test shape: {X_test.shape}")

    keras_model_path = os.path.join(script_dir, 'model.keras')
    joblib_model_path = os.path.join(script_dir, 'model.pkl')

    if HAS_KERAS:
        print("\n--- Training Keras Deep Neural Network ---")
        input_dim = X_train.shape[1]
        model = Sequential([
            Input(shape=(input_dim,)),
            Dense(64, activation='relu'),
            Dropout(0.2),
            Dense(32, activation='relu'),
            Dropout(0.2),
            Dense(16, activation='relu'),
            Dense(1, activation='sigmoid')
        ])

        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )

        model.summary()

        early_stop = EarlyStopping(monitor='val_loss', patience=8, restore_best_weights=True)
        checkpoint = ModelCheckpoint(filepath=keras_model_path, monitor='val_loss', save_best_only=True)

        history = model.fit(
            X_train, y_train,
            validation_split=0.15,
            epochs=30,
            batch_size=64,
            callbacks=[early_stop, checkpoint],
            verbose=1
        )

        model.save(keras_model_path)
        y_pred_proba = model.predict(X_test)
        y_pred = (y_pred_proba >= 0.5).astype(int).flatten()

        train_acc = history.history['accuracy']
        val_acc = history.history['val_accuracy']
        train_loss = history.history['loss']
        val_loss = history.history['val_loss']
    else:
        print("\n--- Training Deep Multi-Layer Perceptron (MLP) Neural Network ---")
        # 64 -> 32 -> 16 Dense ReLU Architecture
        model = MLPClassifier(
            hidden_layer_sizes=(64, 32, 16),
            activation='relu',
            solver='adam',
            max_iter=50,
            random_state=42,
            early_stopping=True,
            validation_fraction=0.15
        )

        model.fit(X_train, y_train)
        joblib.dump(model, joblib_model_path)

        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1]

        train_acc = model.loss_curve_
        val_acc = [1.0 - loss for loss in model.loss_curve_]
        train_loss = model.loss_curve_
        val_loss = model.loss_curve_

    # Save artifacts
    joblib.dump(scaler, os.path.join(script_dir, 'scaler.pkl'))
    joblib.dump(encoders, os.path.join(script_dir, 'encoder.pkl'))

    # Metrics
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='macro')
    rec = recall_score(y_test, y_pred, average='macro')
    f1 = f1_score(y_test, y_pred, average='macro')
    cm = confusion_matrix(y_test, y_pred)

    print("\n" + "="*48)
    print("     NEURAL NETWORK MODEL EVALUATION METRICS     ")
    print("="*48)
    print(f"Accuracy : {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall   : {rec * 100:.2f}%")
    print(f"F1 Score : {f1 * 100:.2f}%")
    print("\nConfusion Matrix:\n", cm)
    print("="*48 + "\n")

    # Generate & Save Plots inside ml/results/
    results_dir = os.path.join(script_dir, 'results')
    os.makedirs(results_dir, exist_ok=True)

    if HAS_PLOTTING:
        # Accuracy plot
        plt.figure(figsize=(8, 5))
        plt.plot(train_acc, label='Train Accuracy', color='#1D4ED8', linewidth=2)
        plt.plot(val_acc, label='Val Accuracy', color='#0EA5E9', linewidth=2)
        plt.title('Neural Network Accuracy Plot', fontsize=14, fontweight='bold', pad=12)
        plt.xlabel('Epoch / Iteration', fontsize=12)
        plt.ylabel('Accuracy', fontsize=12)
        plt.legend(loc='lower right')
        plt.grid(True, linestyle='--', alpha=0.5)
        plt.tight_layout()
        plt.savefig(os.path.join(results_dir, 'accuracy.png'), dpi=300)
        plt.close()

        # Loss plot
        plt.figure(figsize=(8, 5))
        plt.plot(train_loss, label='Train Loss', color='#DC2626', linewidth=2)
        plt.plot(val_loss, label='Val Loss', color='#F59E0B', linewidth=2)
        plt.title('Neural Network Loss Curve', fontsize=14, fontweight='bold', pad=12)
        plt.xlabel('Epoch / Iteration', fontsize=12)
        plt.ylabel('Loss', fontsize=12)
        plt.legend(loc='upper right')
        plt.grid(True, linestyle='--', alpha=0.5)
        plt.tight_layout()
        plt.savefig(os.path.join(results_dir, 'loss.png'), dpi=300)
        plt.close()

        # Confusion Matrix plot
        plt.figure(figsize=(6, 5))
        class_names = target_encoder.classes_
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
        plt.title('Confusion Matrix', fontsize=14, fontweight='bold', pad=12)
        plt.xlabel('Predicted Label', fontsize=12)
        plt.ylabel('True Label', fontsize=12)
        plt.tight_layout()
        plt.savefig(os.path.join(results_dir, 'confusion_matrix.png'), dpi=300)
        plt.close()

        print(f"Evaluation graphs saved in {results_dir}/")
    else:
        # Save summary text metrics into results folder
        with open(os.path.join(results_dir, 'metrics_report.txt'), 'w') as f:
            f.write(f"Accuracy: {acc * 100:.2f}%\n")
            f.write(f"Precision: {prec * 100:.2f}%\n")
            f.write(f"Recall: {rec * 100:.2f}%\n")
            f.write(f"F1 Score: {f1 * 100:.2f}%\n")
            f.write(f"Confusion Matrix:\n{cm}\n")
        print(f"Summary metrics saved in {results_dir}/metrics_report.txt")

if __name__ == '__main__':
    train_neural_network_model()
