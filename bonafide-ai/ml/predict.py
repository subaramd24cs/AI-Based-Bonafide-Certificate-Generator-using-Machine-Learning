import os
import joblib
import numpy as np
import pandas as pd

class BonafidePredictor:
    def __init__(self, base_dir=None):
        if base_dir is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
        self.base_dir = base_dir
        self.model = None
        self.scaler = None
        self.encoders = None
        self.is_keras = False
        self.load_artifacts()

    def load_artifacts(self):
        keras_path = os.path.join(self.base_dir, 'model.keras')
        h5_path = os.path.join(self.base_dir, 'model.h5')
        pkl_path = os.path.join(self.base_dir, 'model.pkl')
        scaler_path = os.path.join(self.base_dir, 'scaler.pkl')
        encoder_path = os.path.join(self.base_dir, 'encoder.pkl')

        # Load Keras or MLP model
        if os.path.exists(keras_path):
            try:
                import tensorflow as tf
                self.model = tf.keras.models.load_model(keras_path)
                self.is_keras = True
            except Exception as e:
                print("Could not load Keras model, checking PKL fallback:", e)

        if not self.model and os.path.exists(h5_path):
            try:
                import tensorflow as tf
                self.model = tf.keras.models.load_model(h5_path)
                self.is_keras = True
            except Exception as e:
                print("Could not load H5 model:", e)

        if not self.model and os.path.exists(pkl_path):
            self.model = joblib.load(pkl_path)
            self.is_keras = False

        if not self.model:
            raise FileNotFoundError("No trained Neural Network model found (model.keras or model.pkl).")

        self.scaler = joblib.load(scaler_path)
        self.encoders = joblib.load(encoder_path)
        print(f"Neural Network Predictor loaded successfully (Keras: {self.is_keras}).")

    def predict(self, input_data: dict):
        attendance = float(input_data.get('attendance', input_data.get('attendance_percentage', 75.0)))
        cgpa = float(input_data.get('cgpa', 7.5))
        semester = int(input_data.get('semester', 1))
        prev_count = int(input_data.get('previousBonafideCount', input_data.get('previous_bonafide_count', 0)))

        fee_status = input_data.get('feeStatus', input_data.get('fee_status', 'Paid'))
        academic_status = input_data.get('academicStatus', input_data.get('academic_status', 'Good'))
        purpose = input_data.get('purpose', input_data.get('application_purpose', 'Scholarship'))
        prev_app_status = input_data.get('previousApplicationStatus', input_data.get('previous_application_status', 'Approved'))
        disc_status = input_data.get('disciplinaryStatus', input_data.get('disciplinary_status', 'Clear'))
        course = input_data.get('course', 'MCA')
        department = input_data.get('department', 'Computer Science')

        def safe_encode(col_name, val):
            encoder = self.encoders.get(col_name)
            if encoder is None:
                return 0
            if str(val) in encoder.classes_:
                return int(encoder.transform([str(val)])[0])
            else:
                return 0

        encoded_fee = safe_encode('fee_status', fee_status)
        encoded_academic = safe_encode('academic_status', academic_status)
        encoded_purpose = safe_encode('application_purpose', purpose)
        encoded_prev_app = safe_encode('previous_application_status', prev_app_status)
        encoded_disc = safe_encode('disciplinary_status', disc_status)
        encoded_course = safe_encode('course', course)
        encoded_dept = safe_encode('department', department)

        feature_vector = np.array([[
            attendance, cgpa, semester, prev_count,
            encoded_fee, encoded_academic, encoded_purpose,
            encoded_prev_app, encoded_disc, encoded_course, encoded_dept
        ]])

        scaled_features = self.scaler.transform(feature_vector)

        target_encoder = self.encoders['target_encoder']

        if self.is_keras:
            prediction_proba = float(self.model.predict(scaled_features, verbose=0)[0][0])
            predicted_idx = 1 if prediction_proba >= 0.5 else 0
            confidence = prediction_proba if predicted_idx == 1 else (1.0 - prediction_proba)
            probability_approved = 1.0 - prediction_proba
        else:
            proba_arr = self.model.predict_proba(scaled_features)[0]
            predicted_idx = int(self.model.predict(scaled_features)[0])
            confidence = float(np.max(proba_arr))
            probability_approved = float(proba_arr[0])

        prediction_label = target_encoder.inverse_transform([predicted_idx])[0]

        return {
            "prediction": str(prediction_label),
            "confidence": round(confidence, 4),
            "probability_approved": round(float(probability_approved), 4)
        }

if __name__ == '__main__':
    predictor = BonafidePredictor()
    sample = {
        "attendance": 90.0,
        "cgpa": 8.5,
        "feeStatus": "Paid",
        "semester": 4,
        "academicStatus": "Good",
        "previousBonafideCount": 1,
        "purpose": "Scholarship",
        "previousApplicationStatus": "Approved",
        "disciplinaryStatus": "Clear"
    }
    print(predictor.predict(sample))
