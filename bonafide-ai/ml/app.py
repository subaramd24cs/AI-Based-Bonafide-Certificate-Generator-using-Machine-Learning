import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from predict import BonafidePredictor

app = FastAPI(
    title="Bonafide AI Machine Learning Service",
    description="TensorFlow/Keras Deep Neural Network API for Bonafide Certificate Verification",
    version="2.0.0"
)

# Enable CORS for cross-origin communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize predictor singleton
predictor = None

@app.on_event("startup")
def startup_event():
    global predictor
    try:
        predictor = BonafidePredictor()
        print("FastAPI ML Service: Keras model loaded successfully.")
    except Exception as e:
        print(f"FastAPI ML Service Error loading model: {e}")

class ApplicationData(BaseModel):
    attendance: Optional[float] = Field(default=75.0, description="Attendance percentage 0-100")
    attendance_percentage: Optional[float] = None
    feeStatus: Optional[str] = Field(default="Paid", description="Fee status: Paid / Pending")
    fee_status: Optional[str] = None
    semester: Optional[int] = Field(default=1, description="Semester 1-6")
    cgpa: Optional[float] = Field(default=7.5, description="CGPA 0.0-10.0")
    academicStatus: Optional[str] = Field(default="Good", description="Academic status: Good / Average / Poor")
    academic_status: Optional[str] = None
    previousBonafideCount: Optional[int] = Field(default=0, description="Previous certificates count")
    previous_bonafide_count: Optional[int] = None
    purpose: Optional[str] = Field(default="Scholarship", description="Purpose of certificate")
    application_purpose: Optional[str] = None
    previousApplicationStatus: Optional[str] = Field(default="Approved", description="Previous application status")
    previous_application_status: Optional[str] = None
    disciplinaryStatus: Optional[str] = Field(default="Clear", description="Disciplinary status: Clear / Warning")
    disciplinary_status: Optional[str] = None
    course: Optional[str] = Field(default="MCA", description="Course name")
    department: Optional[str] = Field(default="Computer Science", description="Department name")

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "Bonafide AI ML Service",
        "framework": "TensorFlow / Keras",
        "model_loaded": predictor is not None and predictor.model is not None
    }

@app.post("/predict")
@app.post("/api/ml/predict")
def predict_certificate_approval(data: ApplicationData):
    if predictor is None or predictor.model is None:
        raise HTTPException(status_code=503, detail="ML Model is not loaded.")

    try:
        payload = data.dict(exclude_none=True)
        res = predictor.predict(payload)
        return {
            "success": True,
            "prediction": res["prediction"],
            "confidence": res["confidence"],
            "probability_approved": res["probability_approved"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5001, reload=False)
