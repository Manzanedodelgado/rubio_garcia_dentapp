import asyncio
import aiohttp
import csv
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from motor.motor_asyncio import AsyncIOMotorClient
import os
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
import uuid

logger = logging.getLogger(__name__)

# Pydantic Models
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

# Google Sheets Service
class GoogleSheetsService:
    def __init__(self, db_client: AsyncIOMotorClient):
        self.db = db_client[os.environ['DB_NAME']]
        # Use the public CSV export URL for the Google Sheets
        self.sheet_url = "https://docs.google.com/spreadsheets/d/1MBDBHQ08XGuf5LxVHCFhHDagIazFkpBnxwqyEQIBJrQ/export?format=csv&gid=0"
        self.last_update = None
        
    async def fetch_sheet_data(self) -> List[Dict]:
        """Fetch data from Google Sheets CSV export"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.sheet_url) as response:
                    if response.status == 200:
                        csv_content = await response.text()
                        return self.parse_csv_data(csv_content)
                    else:
                        logger.error(f"Failed to fetch sheet data: HTTP {response.status}")
                        return []
        except Exception as e:
            logger.error(f"Error fetching sheet data: {str(e)}")
            return []
    
    def parse_csv_data(self, csv_content: str) -> List[Dict]:
        """Parse CSV content and map to appointment structure"""
        appointments = []
        csv_reader = csv.DictReader(csv_content.splitlines())
        
        for row in csv_reader:
            try:
                # Map columns from Google Sheets to our appointment structure
                appointment = self.map_appointment_data(row)
                if appointment:
                    appointments.append(appointment)
            except Exception as e:
                logger.warning(f"Error parsing row: {row}, Error: {str(e)}")
                continue
                
        return appointments
    
    def parse_time(self, time_str: str) -> str:
        """Normalize time to HH:MM (24h)"""
        if not time_str:
            return ""
        candidates = [
            "%H:%M",
            "%H.%M",
            "%I:%M %p",
            "%I.%M %p",
            "%H:%M:%S",
            "%I:%M:%S %p",
            "%H%M",
        ]
        cleaned = time_str.strip()
        for fmt in candidates:
            try:
                t = datetime.strptime(cleaned, fmt)
                return t.strftime("%H:%M")
            except ValueError:
                continue
        # Try to coerce simple cases like "9:0" -> 09:00
        parts = cleaned.replace(".", ":").split(":")
        if len(parts) >= 2 and parts[0].isdigit() and parts[1].isdigit():
            hh = parts[0].zfill(2)
            mm = parts[1].zfill(2)
            return f"{hh}:{mm}"
        return cleaned

    def map_appointment_data(self, row: Dict) -> Optional[Dict]:
        """Map Google Sheets columns to appointment structure"""
        try:
            # Expected column mappings - adjust based on actual sheet structure
            column_mappings = {
                'fecha': ['Fecha', 'Date', 'fecha', 'FECHA'],
                'hora': ['Hora', 'Time', 'hora', 'HORA'],
                'paciente': ['Paciente', 'Patient', 'paciente', 'PACIENTE', 'Nombre', 'Name'],
                'tratamiento': ['Tratamiento', 'Treatment', 'tratamiento', 'TRATAMIENTO', 'Servicio', 'Service'],
                'doctor': ['Doctor', 'Médico', 'doctor', 'DOCTOR'],
                'estado': ['Estado', 'Status', 'estado', 'ESTADO'],
                'telefono': ['Teléfono', 'Phone', 'telefono', 'TELEFONO', 'Tel'],
                'notas': ['Notas', 'Notes', 'notas', 'NOTAS', 'Observaciones']
            }
            
            # Find actual column names by checking different variations
            mapped_data = {}
            for field, possible_names in column_mappings.items():
                value = None
                for name in possible_names:
                    if name in row and row[name] and row[name].strip():
                        value = row[name].strip()
                        break
                mapped_data[field] = value or ""
            
            # Skip empty rows
            if not any([mapped_data.get('paciente'), mapped_data.get('fecha'), mapped_data.get('hora')]):
                return None
            
            # Parse and format data
            appointment = {
                'external_id': f"{mapped_data.get('fecha', '')}_{mapped_data.get('hora', '')}_{mapped_data.get('paciente', '')}".replace(' ', '_'),
                'date': self.parse_date(mapped_data.get('fecha', '')),
                'time': mapped_data.get('hora', ''),
                'patient_name': mapped_data.get('paciente', ''),
                'treatment': mapped_data.get('tratamiento', ''),
                'doctor': mapped_data.get('doctor', ''),
                'status': self.parse_status(mapped_data.get('estado', '')),
                'phone': mapped_data.get('telefono', ''),
                'notes': mapped_data.get('notas', ''),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'source': 'google_sheets'
            }
            
            return appointment
            
        except Exception as e:
            logger.error(f"Error mapping appointment data: {str(e)}")
            return None
    
    def parse_date(self, date_str: str) -> Optional[str]:
        """Parse various date formats"""
        if not date_str:
            return None
            
        date_formats = [
            '%d/%m/%Y',
            '%Y-%m-%d', 
            '%d-%m-%Y',
            '%m/%d/%Y',
            '%Y/%m/%d'
        ]
        
        for fmt in date_formats:
            try:
                parsed_date = datetime.strptime(date_str, fmt)
                return parsed_date.strftime('%Y-%m-%d')
            except ValueError:
                continue
                
        logger.warning(f"Could not parse date: {date_str}")
        return date_str
    
    def parse_status(self, status_str: str) -> str:
        """Normalize status values"""
        if not status_str:
            return 'pending'
            
        status_lower = status_str.lower().strip()
        
        status_mappings = {
            'confirmada': 'confirmed',
            'confirmed': 'confirmed',
            'completada': 'completed', 
            'completed': 'completed',
            'cancelada': 'cancelled',
            'cancelled': 'cancelled',
            'pendiente': 'pending',
            'pending': 'pending',
            'reagendada': 'rescheduled',
            'rescheduled': 'rescheduled'
        }
        
        return status_mappings.get(status_lower, 'pending')
    
    async def sync_appointments(self) -> Dict:
        """Sync appointments from Google Sheets to MongoDB"""
        try:
            logger.info("Starting appointments sync from Google Sheets")
            
            # Fetch data from Google Sheets
            sheet_appointments = await self.fetch_sheet_data()
            
            if not sheet_appointments:
                logger.warning("No appointments found in Google Sheets")
                return {"success": False, "message": "No data found", "synced": 0}
            
            # Clear existing appointments from sheets
            await self.db.appointments.delete_many({"source": "google_sheets"})
            
            # Insert new appointments
            if sheet_appointments:
                result = await self.db.appointments.insert_many(sheet_appointments)
                synced_count = len(result.inserted_ids)
            else:
                synced_count = 0
            
            # Update last sync time
            self.last_update = datetime.utcnow()
            
            logger.info(f"Successfully synced {synced_count} appointments")
            
            return {
                "success": True,
                "synced": synced_count,
                "last_update": self.last_update.isoformat(),
                "message": f"Successfully synced {synced_count} appointments"
            }
            
        except Exception as e:
            logger.error(f"Error syncing appointments: {str(e)}")
            return {"success": False, "message": str(e), "synced": 0}
    
    async def get_appointments(self, 
                             start_date: Optional[str] = None, 
                             end_date: Optional[str] = None,
                             status: Optional[str] = None) -> List[Dict]:
        """Get appointments with optional filters"""
        try:
            query = {"source": "google_sheets"}
            
            # Add date filters
            if start_date:
                query["date"] = {"$gte": start_date}
            if end_date:
                if "date" in query:
                    query["date"]["$lte"] = end_date
                else:
                    query["date"] = {"$lte": end_date}
            
            # Add status filter
            if status:
                query["status"] = status
            
            appointments = await self.db.appointments.find(query).to_list(1000)
            
            # Convert ObjectId to string for JSON serialization
            for appointment in appointments:
                appointment["_id"] = str(appointment["_id"])
                
            return appointments
            
        except Exception as e:
            logger.error(f"Error fetching appointments: {str(e)}")
            return []
    
    async def start_auto_sync(self, interval_minutes: int = 5):
        """Start automatic sync every N minutes"""
        logger.info(f"Starting auto-sync every {interval_minutes} minutes")
        
        while True:
            try:
                await self.sync_appointments()
                await asyncio.sleep(interval_minutes * 60)  # Convert to seconds
            except Exception as e:
                logger.error(f"Error in auto-sync: {str(e)}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying

# Router setup
def create_appointments_router(db_client: AsyncIOMotorClient):
    router = APIRouter(prefix="/api/appointments", tags=["appointments"])
    sheets_service = GoogleSheetsService(db_client)
    
    @router.get("/", response_model=List[Appointment])
    async def get_appointments(
        start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
        status: Optional[str] = Query(None, description="Appointment status"),
        patient: Optional[str] = Query(None, description="Patient name filter")
    ):
        """Get appointments with optional filters"""
        try:
            appointments = await sheets_service.get_appointments(start_date, end_date, status)
            
            # Filter by patient name if provided
            if patient:
                patient_lower = patient.lower()
                appointments = [
                    apt for apt in appointments 
                    if patient_lower in apt.get('patient_name', '').lower()
                ]
            
            return appointments
        except Exception as e:
            logger.error(f"Error in get_appointments: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error fetching appointments: {str(e)}")

    @router.get("/today/", response_model=List[Appointment])
    async def get_today_appointments():
        """Get today's appointments"""
        today = datetime.now().strftime('%Y-%m-%d')
        try:
            appointments = await sheets_service.get_appointments(start_date=today, end_date=today)
            return appointments
        except Exception as e:
            logger.error(f"Error in get_today_appointments: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error fetching today's appointments: {str(e)}")

    @router.get("/stats/", response_model=AppointmentStats)
    async def get_appointment_stats():
        """Get appointment statistics"""
        try:
            db = sheets_service.db
            
            # Get all appointments count
            total = await db.appointments.count_documents({"source": "google_sheets"})
            
            # Today's appointments
            today = datetime.now().strftime('%Y-%m-%d')
            today_count = await db.appointments.count_documents({
                "source": "google_sheets",
                "date": today
            })
            
            # Count by status
            confirmed = await db.appointments.count_documents({
                "source": "google_sheets", 
                "status": "confirmed"
            })
            
            pending = await db.appointments.count_documents({
                "source": "google_sheets",
                "status": "pending"
            })
            
            completed = await db.appointments.count_documents({
                "source": "google_sheets",
                "status": "completed"
            })
            
            cancelled = await db.appointments.count_documents({
                "source": "google_sheets",
                "status": "cancelled"
            })
            
            stats = AppointmentStats(
                total_appointments=total,
                today_appointments=today_count,
                confirmed_appointments=confirmed,
                pending_appointments=pending,
                completed_appointments=completed,
                cancelled_appointments=cancelled
            )
            
            logger.info(f"Stats calculated: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Error fetching stats: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

    @router.post("/sync/", response_model=SyncResult)
    async def sync_appointments():
        """Manually trigger sync from Google Sheets"""
        try:
            result = await sheets_service.sync_appointments()
            return SyncResult(**result)
        except Exception as e:
            logger.error(f"Error in sync_appointments: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

    @router.get("/sync/status/")
    async def get_sync_status():
        """Get last sync information"""
        return {
            "last_update": sheets_service.last_update.isoformat() if sheets_service.last_update else None,
            "auto_sync_active": True,
            "sync_interval_minutes": 5
        }

    @router.get("/upcoming/", response_model=List[Appointment])
    async def get_upcoming_appointments(days: int = Query(7, description="Number of days ahead")):
        """Get upcoming appointments for the next N days"""
        try:
            start_date = datetime.now().strftime('%Y-%m-%d')
            end_date = (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%d')
            
            appointments = await sheets_service.get_appointments(start_date=start_date, end_date=end_date)
            
            # Filter only confirmed and pending appointments
            upcoming = [
                apt for apt in appointments 
                if apt.get('status') in ['confirmed', 'pending']
            ]
            
            # Sort by date and time
            upcoming.sort(key=lambda x: (x.get('date', ''), x.get('time', '')))
            
            return upcoming
            
        except Exception as e:
            logger.error(f"Error in get_upcoming_appointments: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error fetching upcoming appointments: {str(e)}")
    
    # Start background sync
    async def start_background_sync():
        """Start the background sync process"""
        asyncio.create_task(sheets_service.start_auto_sync(interval_minutes=5))
    
    # Store the sync function for external access
    router.start_background_sync = start_background_sync
    
    return router