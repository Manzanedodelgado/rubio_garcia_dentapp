from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class AppointmentBase(BaseModel):
    external_id: str
    date: str
    time: str
    patient_name: str
    treatment: str = ""
    doctor: str = ""
    status: str = "pending"  # pending, confirmed, completed, cancelled, rescheduled
    phone: str = ""
    notes: str = ""
    source: str = "google_sheets"

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    patient_name: Optional[str] = None
    treatment: Optional[str] = None
    doctor: Optional[str] = None
    status: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None

class Appointment(AppointmentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AppointmentStats(BaseModel):
    total_appointments: int = 0
    today_appointments: int = 0
    confirmed_appointments: int = 0
    pending_appointments: int = 0
    completed_appointments: int = 0
    cancelled_appointments: int = 0

class SyncResult(BaseModel):
    success: bool
    synced: int
    message: str
    last_update: Optional[str] = None