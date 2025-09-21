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

# =====================
# Pydantic Models
# =====================
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
    # Extended fields from Google Sheets
    num_paciente: Optional[str] = ""
    last_name: Optional[str] = ""
    estado_cita: Optional[str] = ""
    registro: Optional[str] = ""
    cit_mod: Optional[str] = ""
    fecha_alta: Optional[str] = ""
    duration: Optional[str] = ""
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

# =====================
# Google Sheets Service
# =====================
class GoogleSheetsService:
    def __init__(self, db_client: AsyncIOMotorClient):
        self.db = db_client[os.environ['DB_NAME']]
        self.overrides = self.db.get_collection('appointment_overrides')
        # Google Sheet CSV URLs
        self.sheet_url = "https://docs.google.com/spreadsheets/d/1MBDBHQ08XGuf5LxVHCFhHDagIazFkpBnxwqyEQIBJrQ/export?format=csv&gid=0"
        self.fallback_sheet_url = "https://docs.google.com/spreadsheets/d/1MBDBHQ08XGuf5LxVHCFhHDagIazFkpBnxwqyEQIBJrQ/export?format=csv"
        self.last_update = None
        self.last_headers: List[str] = []
        self.last_raw_rows: int = 0
        self.last_fetch_message: str = ""
        
    async def fetch_sheet_data(self) -> List[Dict]:
        """Fetch data from Google Sheets CSV export"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.sheet_url) as response:
                    if response.status == 200:
                        csv_content = await response.text()
                        return self.parse_csv_data(csv_content)
                    else:
                        # Try fallback without gid (first sheet)
                        async with session.get(self.fallback_sheet_url) as r2:
                            if r2.status == 200:
                                csv_content = await r2.text()
                                return self.parse_csv_data(csv_content)
                        logger.error(f"Failed to fetch sheet data: HTTP {response.status}")
                        return []
        except Exception as e:
            logger.error(f"Error fetching sheet data: {str(e)}")
            return []
    
    def parse_csv_data(self, csv_content: str) -> List[Dict]:
        """Parse CSV content and map to appointment structure"""
        appointments: List[Dict] = []
        reader = csv.reader(csv_content.splitlines())
        rows = list(reader)
        if not rows:
            self.last_headers = []
            self.last_raw_rows = 0
            return []
        headers = rows[0]
        self.last_headers = headers
        self.last_raw_rows = len(rows) - 1
        csv_reader = csv.DictReader(csv_content.splitlines())
        
        for row in csv_reader:
            try:
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
        parts = cleaned.replace(".", ":").split(":")
        if len(parts) >= 2 and parts[0].isdigit() and parts[1].isdigit():
            hh = parts[0].zfill(2)
            mm = parts[1].zfill(2)
            return f"{hh}:{mm}"
        return cleaned

    def parse_date(self, date_str: str) -> Optional[str]:
        if not date_str:
            return None
        fmts = ['%d/%m/%Y','%Y-%m-%d','%d-%m-%Y','%m/%d/%Y','%Y/%m/%d']
        for fmt in fmts:
            try:
                return datetime.strptime(date_str, fmt).strftime('%Y-%m-%d')
            except ValueError:
                continue
        logger.warning(f"Could not parse date: {date_str}")
        return date_str

    def parse_status(self, status_str: str) -> str:
        """Normalize status values (tolerant)."""
        if not status_str:
            return 'pending'
        s = status_str.lower().strip()
        direct = {
            'confirmada': 'confirmed','confirmed': 'confirmed',
            'completada': 'completed','completed': 'completed',
            'cancelada': 'cancelled','cancelled': 'cancelled',
            'pendiente': 'pending','pending': 'pending',
            'reagendada': 'rescheduled','rescheduled': 'rescheduled'
        }
        if s in direct:
            return direct[s]
        if 'confirm' in s or 'confirma' in s: return 'confirmed'
        if 'complet' in s or 'realizad' in s: return 'completed'
        if 'cancel' in s or 'anulad' in s: return 'cancelled'
        if 'reagen' in s or 'reprog' in s or 'mover' in s: return 'rescheduled'
        if 'pend' in s: return 'pending'
        return 'pending'

    def map_appointment_data(self, row: Dict) -> Optional[Dict]:
        """Map Google Sheets columns to appointment structure"""
        column_mappings = {
            'fecha': ['Fecha','Date','fecha','FECHA','Día','Dia','Fecha Cita','Fecha cita','Fecha de la cita'],
            'hora': ['Hora','Time','hora','HORA','Hora Cita','Hora cita','Hora de la cita','Inicio','Start Time','Hora Inicio','Hora de Entrada'],
            'nombre': ['Nombre','Name','Nombre Paciente','Nombre completo'],
            'apellidos': ['Apellidos'],
            'num_pac': ['NumPac','Nº Paciente','NumeroPaciente','Número Paciente'],
            'tratamiento': ['Tratamiento','Treatment','tratamiento','TRATAMIENTO','Servicio','Service','Motivo','Tipo','Tipo de cita','Servicio solicitado'],
            'doctor': ['Doctor','Médico','doctor','DOCTOR','Odontólogo','Odontologo','Profesional','Doctor asignado','Odontologo'],
            'estado': ['Estado','Status','estado','ESTADO','Estatus','Situación'],
            'estado_cita': ['EstadoCita','Estado cita','Estatus cita'],
            'telefono': ['Teléfono','Phone','telefono','TELEFONO','Tel','Móvil','Movil','Celular','Tfno','Tlf','Teléfono 1','Teléfono móvil','TelMovil'],
            'notas': ['Notas','Notes','notas','NOTAS','Observaciones','Comentario','Comentarios','Observación'],
            'registro': ['Registro'],
            'citmod': ['CitMod'],
            'fecha_alta': ['FechaAlta'],
            'duracion': ['Duracion']
        }
        mapped_data: Dict[str,str] = {}
        for field, names in column_mappings.items():
            val = ""
            for n in names:
                if n in row and str(row[n]).strip():
                    val = str(row[n]).strip()
                    break
            mapped_data[field] = val
        if not any([mapped_data.get('nombre'), mapped_data.get('apellidos'), mapped_data.get('fecha'), mapped_data.get('hora')]):
            return None
        full_name = " ".join([x for x in [mapped_data.get('nombre',''), mapped_data.get('apellidos','')] if x]).strip() or mapped_data.get('nombre','') or mapped_data.get('apellidos','')
        return {
            'external_id': f"{mapped_data.get('fecha','')}_{mapped_data.get('hora','')}_{full_name}".replace(' ','_'),
            'date': self.parse_date(mapped_data.get('fecha','')),
            'time': self.parse_time(mapped_data.get('hora','')),
            'patient_name': full_name,
            'last_name': mapped_data.get('apellidos',''),
            'treatment': mapped_data.get('tratamiento',''),
            'doctor': mapped_data.get('doctor',''),
            'status': self.parse_status(mapped_data.get('estado_cita','') or mapped_data.get('estado','')),
            'estado_cita': mapped_data.get('estado_cita','') or mapped_data.get('estado',''),
            'phone': mapped_data.get('telefono',''),
            'notes': mapped_data.get('notas',''),
            'num_paciente': mapped_data.get('num_pac',''),
            'registro': mapped_data.get('registro',''),
            'cit_mod': mapped_data.get('citmod',''),
            'fecha_alta': mapped_data.get('fecha_alta',''),
            'duration': mapped_data.get('duracion',''),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'source': 'google_sheets'
        }

    async def sync_appointments(self) -> Dict:
        try:
            logger.info("Starting appointments sync from Google Sheets")
            data = await self.fetch_sheet_data()
            if not data:
                logger.warning("No appointments found in Google Sheets")
                return {"success": False, "message": "No data found", "synced": 0}
            await self.db.appointments.delete_many({"source": "google_sheets"})
            if data:
                result = await self.db.appointments.insert_many(data)
                synced_count = len(result.inserted_ids)
            else:
                synced_count = 0
            self.last_update = datetime.utcnow()
            logger.info(f"Successfully synced {synced_count} appointments")
            return {"success": True, "synced": synced_count, "last_update": self.last_update.isoformat(), "message": f"Successfully synced {synced_count} appointments"}
        except Exception as e:
            logger.error(f"Error syncing appointments: {str(e)}")
            return {"success": False, "message": str(e), "synced": 0}

    async def set_status_override(self, appointment_id: str, new_status: str, new_estado_cita: Optional[str] = None):
        await self.overrides.update_one(
            {"appointment_id": appointment_id},
            {"$set": {
                "appointment_id": appointment_id,
                "status": new_status,
                "estado_cita": new_estado_cita if new_estado_cita is not None else new_status,
                "updated_at": datetime.utcnow()
            }},
            upsert=True
        )

    async def apply_overrides(self, appointments: List[Dict]) -> List[Dict]:
        ids = [a.get('_id') for a in appointments if a.get('_id')]
        if not ids:
            return appointments
        cursor = self.overrides.find({"appointment_id": {"$in": ids}})
        overrides = {doc["appointment_id"]: doc async for doc in cursor}
        for a in appointments:
            ov = overrides.get(a.get('_id'))
            if ov:
                a['status'] = ov.get('status', a.get('status'))
                a['estado_cita'] = ov.get('estado_cita', a.get('estado_cita'))
        return appointments

    async def get_appointments(self,
                               start_date: Optional[str] = None,
                               end_date: Optional[str] = None,
                               status: Optional[str] = None,
                               limit: int = 10000) -> List[Dict]:
        try:
            query = {"source": "google_sheets"}
            if start_date:
                query["date"] = {"$gte": start_date}
            if end_date:
                if "date" in query:
                    query["date"]["$lte"] = end_date
                else:
                    query["date"] = {"$lte": end_date}
            if status:
                query["status"] = status
            cursor = self.db.appointments.find(query).sort([
                ("date", 1),
                ("time", 1)
            ]).limit(limit)
            appointments = await cursor.to_list(length=limit)
            for a in appointments:
                a["_id"] = str(a["_id"])  # ObjectId -> str
            appointments = await self.apply_overrides(appointments)
            return appointments
        except Exception as e:
            logger.error(f"Error fetching appointments: {str(e)}")
            return []

    async def start_auto_sync(self, interval_minutes: int = 5):
        logger.info(f"Starting auto-sync every {interval_minutes} minutes")
        while True:
            try:
                await self.sync_appointments()
                await asyncio.sleep(interval_minutes * 60)
            except Exception as e:
                logger.error(f"Error in auto-sync: {str(e)}")
                await asyncio.sleep(60)

# =====================
# Router setup
# =====================
def create_appointments_router(db_client: AsyncIOMotorClient):
    router = APIRouter(prefix="/api/appointments", tags=["appointments"])
    sheets_service = GoogleSheetsService(db_client)

    @router.get("/", response_model=List[Appointment])
    async def get_appointments(
        start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
        status: Optional[str] = Query(None, description="Appointment status"),
        patient: Optional[str] = Query(None, description="Patient name filter"),
        limit: int = Query(1000, ge=1, le=20000, description="Max number of records to return")
    ):
        try:
            appointments = await sheets_service.get_appointments(start_date, end_date, status, limit)
            if patient:
                patient_lower = patient.lower()
                appointments = [apt for apt in appointments if patient_lower in apt.get('patient_name','').lower()]
            return appointments
        except Exception as e:
            logger.error(f"Error in get_appointments: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error fetching appointments: {str(e)}")

    @router.get("/today/", response_model=List[Appointment])
    async def get_today_appointments():
        today = datetime.now().strftime('%Y-%m-%d')
        try:
            appointments = await sheets_service.get_appointments(start_date=today, end_date=today)
            return appointments
        except Exception as e:
            logger.error(f"Error in get_today_appointments: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error fetching today's appointments: {str(e)}")

    @router.get("/stats/", response_model=AppointmentStats)
    async def get_appointment_stats():
        try:
            db = sheets_service.db
            total = await db.appointments.count_documents({"source": "google_sheets"})
            today = datetime.now().strftime('%Y-%m-%d')
            today_count = await db.appointments.count_documents({"source": "google_sheets","date": today})
            confirmed = await db.appointments.count_documents({"source": "google_sheets","status": "confirmed"})
            pending = await db.appointments.count_documents({"source": "google_sheets","status": "pending"})
            completed = await db.appointments.count_documents({"source": "google_sheets","status": "completed"})
            cancelled = await db.appointments.count_documents({"source": "google_sheets","status": "cancelled"})
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
        try:
            result = await sheets_service.sync_appointments()
            return SyncResult(**result)
        except Exception as e:
            logger.error(f"Error in sync_appointments: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

    @router.get("/sync/status/")
    async def get_sync_status():
        return {
            "last_update": sheets_service.last_update.isoformat() if sheets_service.last_update else None,
            "auto_sync_active": True,
            "sync_interval_minutes": 5,
            "headers": getattr(sheets_service, 'last_headers', []),
            "row_count": getattr(sheets_service, 'last_raw_rows', 0),
        }

    @router.get("/sync/headers/")
    async def get_sync_headers():
        return {"headers": getattr(sheets_service, 'last_headers', []), "row_count": getattr(sheets_service, 'last_raw_rows', 0)}

    @router.get("/upcoming/", response_model=List[Appointment])
    async def get_upcoming_appointments(days: int = Query(7, description="Number of days ahead")):
        try:
            start_date = datetime.now().strftime('%Y-%m-%d')
            end_date = (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%d')
            appointments = await sheets_service.get_appointments(start_date=start_date, end_date=end_date)
            upcoming = [apt for apt in appointments if apt.get('status') in ['confirmed','pending']]
            def norm_time(t: str) -> str:
                if not t: return ""
                try: return datetime.strptime(t, "%H:%M").strftime("%H:%M")
                except Exception: return t
            upcoming.sort(key=lambda x: (x.get('date',''), norm_time(x.get('time',''))))
            return upcoming
        except Exception as e:
            logger.error(f"Error in get_upcoming_appointments: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error fetching upcoming appointments: {str(e)}")

    @router.post("/{appointment_id}/status")
    async def update_status(appointment_id: str, new_status: str = Query(...), estado_cita_text: Optional[str] = Query(None)):
        try:
            # Persist override so it survives future syncs
            await sheets_service.set_status_override(appointment_id, new_status, estado_cita_text)
            return {"success": True, "appointment_id": appointment_id, "status": new_status, "estado_cita": estado_cita_text or new_status}
        except Exception as e:
            logger.error(f"Error updating status: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")

    async def start_background_sync():
        asyncio.create_task(sheets_service.start_auto_sync(interval_minutes=5))
    router.start_background_sync = start_background_sync
    return router