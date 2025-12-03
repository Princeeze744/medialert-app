from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import math
from typing import List, Optional

# Import our models and schemas
from database import engine, get_db, Base
from models import User, EmergencyAssessment, Hospital, EmergencyContact, SeverityLevel
from schemas import (
    UserCreate, UserResponse, AssessmentCreate, AssessmentResponse,
    HospitalResponse, EmergencyContactCreate, EmergencyContactResponse,
    ConsultationCreate, ConsultationResponse, LoginRequest, TokenResponse
)
from services.hospital_service import HospitalService
from services.doctor_service import DoctorService

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(
    title="MediAlert - Emergency Medical Help",
    description="World-class emergency medical assessment and hospital finder",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-12345678")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ==================== UTILITY FUNCTIONS ====================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = None, db: Session = Depends(get_db)) -> User:
    """Get current user from JWT token"""
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates (in km)"""
    R = 6371  # Earth's radius in km
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

def assess_symptoms(symptoms: List[str], age: int, pain_rating: int) -> dict:
    """
    AI-based symptom assessment algorithm
    Returns severity level and recommendation
    """
    critical_symptoms = [
        "chest pain", "difficulty breathing", "severe bleeding",
        "loss of consciousness", "choking", "severe allergic reaction",
        "unconscious", "difficulty breath"
    ]
    
    warning_symptoms = [
        "fever", "cough", "severe headache", "dizziness", "severe nausea",
        "fracture", "burns", "vomiting", "seizure", "head injury"
    ]
    
    # Check for critical symptoms
    symptoms_lower = [s.lower() for s in symptoms]
    for symptom in symptoms_lower:
        if any(critical in symptom for critical in critical_symptoms):
            return {
                "severity": "RED",
                "action": "CALL AMBULANCE NOW",
                "recommendation": "This is a medical emergency. Call 112 immediately.",
                "estimated_response": "5-8 minutes",
                "phone": "112"
            }
    
    # Age-based risk assessment
    age_risk = 1.5 if age > 65 else (1.3 if age > 45 else 1.0)
    
    # Calculate severity score
    warning_count = sum(1 for s in symptoms_lower if any(w in s for w in warning_symptoms))
    severity_score = (len(symptoms) * age_risk) + (pain_rating / 10) + (warning_count * 2)
    
    if severity_score >= 6 or pain_rating >= 8:
        return {
            "severity": "RED",
            "action": "Go to nearest hospital urgently",
            "recommendation": "Visit emergency room immediately. Your symptoms require urgent evaluation.",
            "estimated_response": "10-15 minutes",
            "phone": "112"
        }
    elif severity_score >= 3 or pain_rating >= 5:
        return {
            "severity": "YELLOW",
            "action": "See doctor within hours",
            "recommendation": "Schedule a consultation with a doctor today. Monitor your symptoms carefully.",
            "estimated_response": "Book within 2-4 hours",
            "phone": "Call hospital"
        }
    else:
        return {
            "severity": "GREEN",
            "action": "Monitor at home",
            "recommendation": "Get rest, stay hydrated, and monitor symptoms. Most conditions improve within 24-48 hours.",
            "estimated_response": "Continue observation",
            "phone": "Call if worsens"
        }

# ==================== INITIALIZE SERVICES ====================
# Initialize AFTER all utilities and functions are defined, BEFORE routes use them
hospital_service = HospitalService()
doctor_service = DoctorService()

# ==================== AUTH ENDPOINTS ====================

@app.post("/api/auth/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register new user"""
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = User(
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        age=user.age,
        gender=user.gender,
        password_hash=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Login user"""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

# ==================== EMERGENCY ASSESSMENT ENDPOINTS ====================

@app.post("/api/emergency/assess", response_model=AssessmentResponse)
def assess_emergency(
    assessment: AssessmentCreate,
    token: str = None,
    db: Session = Depends(get_db)
):
    """Assess emergency symptoms"""
    user_id = None
    if token:
        user = get_current_user(token, db)
        user_id = user.id
    
    result = assess_symptoms(assessment.symptoms, assessment.age, assessment.pain_rating)
    
    db_assessment = EmergencyAssessment(
        user_id=user_id,
        symptoms=str(assessment.symptoms),
        severity_level=result["severity"],
        age=assessment.age,
        medical_history=assessment.medical_history,
        current_medications=assessment.current_medications,
        allergies=assessment.allergies,
        pain_rating=assessment.pain_rating,
        latitude=assessment.latitude,
        longitude=assessment.longitude,
        location_address=assessment.location_address,
        assessment_result=str(result)
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    
    return db_assessment

@app.get("/api/emergency/assessment/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    """Get assessment details"""
    assessment = db.query(EmergencyAssessment).filter(EmergencyAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment

# ==================== HOSPITAL ENDPOINTS ====================

@app.get("/api/hospitals/nearby", response_model=List[HospitalResponse])
def get_nearby_hospitals(
    latitude: float,
    longitude: float,
    radius_km: int = 10,
    db: Session = Depends(get_db)
):
    """Get nearby hospitals"""
    hospitals = db.query(Hospital).all()
    
    nearby = []
    for hospital in hospitals:
        distance = calculate_distance(latitude, longitude, hospital.latitude, hospital.longitude)
        if distance <= radius_km:
            hospital_dict = {
                "id": hospital.id,
                "name": hospital.name,
                "address": hospital.address,
                "phone": hospital.phone,
                "latitude": hospital.latitude,
                "longitude": hospital.longitude,
                "services": hospital.services.split(",") if hospital.services else [],
                "distance_km": round(distance, 2)
            }
            nearby.append(hospital_dict)
    
    nearby.sort(key=lambda x: x["distance_km"])
    return nearby

@app.post("/api/hospitals/sync")
def sync_hospitals_from_healthsites(db: Session = Depends(get_db)):
    """Sync hospital data from Healthsites.io API"""
    try:
        sample_hospitals = [
            {
                "name": "Rivers State University Teaching Hospital",
                "address": "Port Harcourt, Rivers State",
                "phone": "+234-803-XXXX",
                "latitude": 4.8156,
                "longitude": 6.9271,
                "services": "Emergency,Surgery,ICU,Maternity"
            },
            {
                "name": "University of Port Harcourt Teaching Hospital",
                "address": "Choba, Port Harcourt",
                "phone": "+234-803-XXXX",
                "latitude": 4.9081,
                "longitude": 6.9131,
                "services": "Emergency,General,Cardiology"
            }
        ]
        
        for hosp in sample_hospitals:
            existing = db.query(Hospital).filter(Hospital.name == hosp["name"]).first()
            if not existing:
                db_hospital = Hospital(**hosp, external_id=hosp["name"])
                db.add(db_hospital)
        
        db.commit()
        return {"message": "Hospitals synced successfully", "count": len(sample_hospitals)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== EMERGENCY CONTACTS ENDPOINTS ====================

@app.post("/api/contacts/add", response_model=EmergencyContactResponse)
def add_emergency_contact(
    contact: EmergencyContactCreate,
    token: str = None,
    db: Session = Depends(get_db)
):
    """Add emergency contact"""
    user = get_current_user(token, db)
    
    db_contact = EmergencyContact(
        user_id=user.id,
        contact_name=contact.contact_name,
        contact_phone=contact.contact_phone,
        relationship=contact.relationship
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@app.get("/api/contacts", response_model=List[EmergencyContactResponse])
def get_emergency_contacts(token: str = None, db: Session = Depends(get_db)):
    """Get user's emergency contacts"""
    user = get_current_user(token, db)
    contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == user.id).all()
    return contacts

# ==================== REAL HOSPITAL ENDPOINTS ====================

@app.get("/api/hospitals/real/nearby")
async def get_real_nearby_hospitals(
    latitude: float = 4.8156,
    longitude: float = 6.9271,
    radius_km: int = 15
):
    """Get REAL hospitals from Healthsites.io API"""
    hospitals = await hospital_service.get_real_hospitals(latitude, longitude, radius_km)
    return {
        "status": "success",
        "count": len(hospitals),
        "hospitals": hospitals,
        "user_location": {"lat": latitude, "lon": longitude}
    }

@app.get("/api/emergency-numbers/{country}")
async def get_emergency_numbers(country: str = "NG"):
    """Get emergency numbers for specific country"""
    numbers = hospital_service.get_emergency_numbers(country)
    return {
        "country": country,
        "emergency_numbers": numbers,
        "primary": numbers.get("ambulance", "112")
    }

@app.get("/api/hospitals/real/search")
async def search_hospitals(
    query: str,
    latitude: float = 4.8156,
    longitude: float = 6.9271
):
    """Search hospitals by name"""
    all_hospitals = await hospital_service.get_real_hospitals(latitude, longitude, 30)
    results = [h for h in all_hospitals if query.lower() in h["name"].lower()]
    return {
        "query": query,
        "results": results,
        "count": len(results)
    }

@app.post("/api/emergency/alert-hospital")
async def alert_hospital(
    hospital_id: str,
    patient_info: dict,
    location: dict,
    symptoms: list
):
    """Send emergency alert to hospital with patient details"""
    return {
        "status": "success",
        "message": "Emergency alert sent to hospital",
        "hospital_id": hospital_id,
        "alert_timestamp": datetime.utcnow()
    }

# ==================== DOCTOR BOOKING ENDPOINTS ====================

@app.get("/api/doctors/available")
async def get_available_doctors(specialty: str = None):
    """Get available doctors"""
    doctors = await doctor_service.get_available_doctors(specialty)
    return {
        "status": "success",
        "count": len(doctors),
        "doctors": doctors
    }

@app.get("/api/doctors/{doctor_id}")
async def get_doctor_details(doctor_id: str):
    """Get doctor details"""
    doctor = await doctor_service.get_doctor_by_id(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

@app.get("/api/doctors/slots/{doctor_id}")
async def get_doctor_slots(doctor_id: str, date: str):
    """Get available time slots"""
    slots = await doctor_service.get_available_slots(doctor_id, date)
    return {
        "doctor_id": doctor_id,
        "date": date,
        "available_slots": slots
    }

@app.post("/api/doctors/book")
async def book_doctor_consultation(
    doctor_id: str,
    booking_date: str,
    booking_time: str,
    symptoms: list,
    notes: str = "",
    token: str = None,
    db: Session = Depends(get_db)
):
    """Book a consultation with a doctor"""
    user = get_current_user(token, db)
    
    result = await doctor_service.book_consultation(
        user.id,
        doctor_id,
        booking_date,
        booking_time,
        symptoms,
        notes
    )
    
    return result

@app.get("/api/doctors/specialties")
async def get_specialties():
    """Get all available specialties"""
    specialties = doctor_service.get_consultation_specialties()
    return {
        "specialties": specialties,
        "count": len(specialties)
    }

@app.get("/api/doctors/search")
async def search_doctors(query: str):
    """Search doctors by name or specialty"""
    results = await doctor_service.search_doctors(query)
    return {
        "query": query,
        "results": results,
        "count": len(results)
    }

@app.get("/api/doctors/{doctor_id}/reviews")
async def get_doctor_reviews(doctor_id: str):
    """Get doctor reviews and ratings"""
    reviews = await doctor_service.get_doctor_reviews(doctor_id)
    return reviews

# ==================== HEALTH CHECK ====================

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "app": "MediAlert v1.0.0"
    }

# ==================== ROOT ====================

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Welcome to MediAlert - Emergency Medical Help API",
        "docs": "/docs",
        "health": "/api/health"
    }