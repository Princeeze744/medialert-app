from typing import List, Optional
from datetime import datetime, timedelta

class DoctorService:
    """Service for managing doctor consultations and bookings"""
    
    def __init__(self):
        # Mock data for doctors
        self.doctors = [
            {
                "id": "doc_001",
                "name": "Dr. Chioma Okafor",
                "specialty": "General Practitioner",
                "rating": 4.8,
                "available": True,
                "phone": "+234-803-XXXX",
                "experience_years": 8
            },
            {
                "id": "doc_002",
                "name": "Dr. Seun Adeyemi",
                "specialty": "Cardiologist",
                "rating": 4.9,
                "available": True,
                "phone": "+234-803-XXXX",
                "experience_years": 12
            },
            {
                "id": "doc_003",
                "name": "Dr. Ngozi Eze",
                "specialty": "Pediatrician",
                "rating": 4.7,
                "available": True,
                "phone": "+234-803-XXXX",
                "experience_years": 10
            },
            {
                "id": "doc_004",
                "name": "Dr. Kunle Okonkwo",
                "specialty": "Orthopedic Surgeon",
                "rating": 4.6,
                "available": False,
                "phone": "+234-803-XXXX",
                "experience_years": 15
            },
        ]
        
        self.specialties = [
            "General Practitioner",
            "Cardiologist",
            "Pediatrician",
            "Orthopedic Surgeon",
            "Dermatologist",
            "Neurologist",
            "Psychiatrist",
            "Emergency Medicine"
        ]
        
        self.consultations = []
    
    async def get_available_doctors(self, specialty: Optional[str] = None) -> List[dict]:
        """Get list of available doctors, optionally filtered by specialty"""
        doctors = [d for d in self.doctors if d["available"]]
        
        if specialty:
            doctors = [d for d in doctors if specialty.lower() in d["specialty"].lower()]
        
        return doctors
    
    async def get_doctor_by_id(self, doctor_id: str) -> Optional[dict]:
        """Get doctor details by ID"""
        for doctor in self.doctors:
            if doctor["id"] == doctor_id:
                return doctor
        return None
    
    async def get_available_slots(self, doctor_id: str, date: str) -> List[str]:
        """Get available time slots for a doctor on a specific date"""
        # Mock available slots
        slots = [
            "09:00 AM",
            "09:30 AM",
            "10:00 AM",
            "10:30 AM",
            "02:00 PM",
            "02:30 PM",
            "03:00 PM",
            "03:30 PM",
            "04:00 PM"
        ]
        return slots
    
    async def book_consultation(
        self,
        user_id: int,
        doctor_id: str,
        booking_date: str,
        booking_time: str,
        symptoms: List[str],
        notes: str = ""
    ) -> dict:
        """Book a consultation with a doctor"""
        doctor = await self.get_doctor_by_id(doctor_id)
        if not doctor:
            return {"status": "error", "message": "Doctor not found"}
        
        consultation = {
            "consultation_id": f"cons_{len(self.consultations) + 1}",
            "user_id": user_id,
            "doctor_id": doctor_id,
            "doctor_name": doctor["name"],
            "date": booking_date,
            "time": booking_time,
            "symptoms": symptoms,
            "notes": notes,
            "status": "booked",
            "booked_at": datetime.utcnow().isoformat()
        }
        
        self.consultations.append(consultation)
        
        return {
            "status": "success",
            "message": f"Consultation booked with {doctor['name']}",
            "consultation": consultation
        }
    
    def get_consultation_specialties(self) -> List[str]:
        """Get all available specialties"""
        return self.specialties
    
    async def search_doctors(self, query: str) -> List[dict]:
        """Search doctors by name or specialty"""
        query_lower = query.lower()
        results = [
            d for d in self.doctors 
            if query_lower in d["name"].lower() or query_lower in d["specialty"].lower()
        ]
        return results
    
    async def get_doctor_reviews(self, doctor_id: str) -> dict:
        """Get doctor reviews and ratings"""
        doctor = await self.get_doctor_by_id(doctor_id)
        if not doctor:
            return {"status": "error", "message": "Doctor not found"}
        
        return {
            "doctor_id": doctor_id,
            "doctor_name": doctor["name"],
            "rating": doctor["rating"],
            "total_reviews": 150,
            "reviews": [
                {
                    "patient": "Patient A",
                    "rating": 5,
                    "comment": "Excellent service and very professional"
                },
                {
                    "patient": "Patient B",
                    "rating": 4,
                    "comment": "Good doctor, would recommend"
                }
            ]
        }