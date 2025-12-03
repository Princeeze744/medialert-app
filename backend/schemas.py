from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    phone: str
    full_name: str
    age: int
    gender: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    phone: str
    full_name: str
    age: int
    gender: str
    
    class Config:
        from_attributes = True

# Emergency Assessment Schemas
class AssessmentCreate(BaseModel):
    symptoms: List[str]
    age: int
    medical_history: Optional[str] = None
    current_medications: Optional[str] = None
    allergies: Optional[str] = None
    pain_rating: int  # 1-10
    latitude: float
    longitude: float
    location_address: Optional[str] = None
    emergency_contacts_to_notify: Optional[List[int]] = None

class AssessmentResponse(BaseModel):
    id: int
    severity_level: str
    assessment_result: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Hospital Schemas
class HospitalResponse(BaseModel):
    id: int
    name: str
    address: str
    phone: Optional[str]
    latitude: float
    longitude: float
    services: Optional[List[str]]
    distance_km: Optional[float] = None
    
    class Config:
        from_attributes = True

# Emergency Contact Schemas
class EmergencyContactCreate(BaseModel):
    contact_name: str
    contact_phone: str
    relationship: str

class EmergencyContactResponse(BaseModel):
    id: int
    contact_name: str
    contact_phone: str
    relationship: str
    is_active: bool
    
    class Config:
        from_attributes = True

# Consultation Schemas
class ConsultationCreate(BaseModel):
    consultation_type: str
    scheduled_at: Optional[datetime] = None

class ConsultationResponse(BaseModel):
    id: int
    consultation_type: str
    status: str
    scheduled_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Login Schema
class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str