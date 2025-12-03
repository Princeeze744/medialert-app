from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum
from sqlalchemy.sql import func
from database import Base
import enum

# Severity Levels
class SeverityLevel(str, enum.Enum):
    RED = "RED"
    YELLOW = "YELLOW"
    GREEN = "GREEN"

# User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True)
    full_name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    password_hash = Column(String)
    medical_conditions = Column(Text, nullable=True)  # JSON string
    allergies = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Emergency Assessment Model
class EmergencyAssessment(Base):
    __tablename__ = "emergency_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    symptoms = Column(Text)  # JSON array of symptoms
    severity_level = Column(Enum(SeverityLevel), default=SeverityLevel.GREEN)
    age = Column(Integer)
    medical_history = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    pain_rating = Column(Integer)  # 1-10
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_address = Column(String, nullable=True)
    assessment_result = Column(Text, nullable=True)  # JSON with recommendation
    contacts_notified = Column(Boolean, default=False)
    hospital_alert_sent = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# Hospital Model (cached from Healthsites.io)
class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True)
    name = Column(String)
    address = Column(String)
    phone = Column(String, nullable=True)
    latitude = Column(Float)
    longitude = Column(Float)
    services = Column(Text, nullable=True)  # JSON array
    operating_hours = Column(Text, nullable=True)
    emergency_available = Column(Boolean, default=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now())

# Emergency Contact Model
class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    contact_name = Column(String)
    contact_phone = Column(String)
    relationship = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Consultation Model
class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    doctor_name = Column(String, nullable=True)
    consultation_type = Column(String)  # "telemedicine", "phone", "video"
    status = Column(String)  # "scheduled", "ongoing", "completed", "cancelled"
    notes = Column(Text, nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())