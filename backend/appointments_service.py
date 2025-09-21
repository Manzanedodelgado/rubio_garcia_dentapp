import asyncio
import aiohttp
import csv
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from motor.motor_asyncio import AsyncIOMotorClient
import os
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field
from zoneinfo import ZoneInfo
from zoneinfo import ZoneInfo
import uuid
import re
from uuid import uuid4, uuid5, NAMESPACE_DNS

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

# Patients models
class PatientBase(BaseModel):
    first_name: str = ""
    last_name: str = ""
    full_name: str = ""
    phone: str = ""
    email: str = ""
    address: str = ""
    num_paciente: str = ""
    notes: str = ""

class Patient(PatientBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    source: str = "manual"  # manual | derived
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = { datetime: lambda v: v.isoformat() }

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
            'finalizada': 'completed','completada': 'completed','completed': 'completed',
            'cancelada': 'cancelled','cancelled': 'cancelled',
            'planificada': 'pending','pendiente': 'pending','pending': 'pending',
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
# Patients Router
# =====================
def normalize_phone(phone: str) -> str:
    if not phone:
        return ""
    return re.sub(r"\D+", "", phone)

def make_patient_key(num_paciente: str, full_name: str, phone: str) -> str:
    if num_paciente:
        return f"num:{num_paciente.strip()}"
    name_key = (full_name or "").strip().lower()
    phone_key = normalize_phone(phone)
    return f"np:{name_key}|{phone_key}"

def split_name(full_name: str) -> Dict[str,str]:
    parts = (full_name or "").strip().split()
    if not parts:
        return {"first_name":"","last_name":""}
    if len(parts) == 1:
        return {"first_name": parts[0], "last_name": ""}
    return {"first_name": parts[0], "last_name": " ".join(parts[1:])}

class PatientCreate(PatientBase):
    pass

class PatientUpdate(PatientBase):
    pass

def create_patients_router(db_client: AsyncIOMotorClient):
    router = APIRouter(prefix="/api/patients", tags=["patients"])
    db = db_client[os.environ['DB_NAME']]

    @router.get("/")
    async def list_patients():
        # 1) Load manual patients first (take precedence)
        manual_docs = await db.patients.find().to_list(5000)
        patients_map: Dict[str, Dict] = {}
        for doc in manual_docs:
            key = make_patient_key(doc.get('num_paciente',''), doc.get('full_name','') or f"{doc.get('first_name','')} {doc.get('last_name','')}", doc.get('phone',''))
            out = {
                "_id": str(doc.get('_id')),
                "first_name": doc.get('first_name',''),
                "last_name": doc.get('last_name',''),
                "full_name": doc.get('full_name') or f"{doc.get('first_name','')} {doc.get('last_name','')}".strip(),
                "phone": doc.get('phone',''),
                "email": doc.get('email',''),
                "address": doc.get('address',''),
                "num_paciente": doc.get('num_paciente',''),
                "notes": doc.get('notes',''),
                "source": "manual",
            }
            patients_map[key] = out
        # 2) Derive from appointments and fill gaps
        cursor = db.appointments.find({}, {"patient_name":1, "last_name":1, "phone":1, "num_paciente":1})
        async for a in cursor:
            full_name = a.get('patient_name','')
            phone = a.get('phone','')
            nump = a.get('num_paciente','')
            key = make_patient_key(nump, full_name, phone)
            if key in patients_map:
                # fill missing fields only
                p = patients_map[key]
                if not p.get('full_name') and full_name:
                    p['full_name'] = full_name
                if not p.get('phone') and phone:
                    p['phone'] = phone
                if not p.get('num_paciente') and nump:
                    p['num_paciente'] = nump
                continue
            # create derived entry
            name_parts = split_name(full_name)
            derived_id = str(uuid5(NAMESPACE_DNS, key))
            patients_map[key] = {
                "_id": derived_id,
                "first_name": name_parts['first_name'],
                "last_name": name_parts['last_name'],
                "full_name": full_name,
                "phone": phone,
                "email": "",
                "address": "",
                "num_paciente": nump,
                "notes": "",
                "source": "derived",
            }
        return list(patients_map.values())

    @router.post("/", response_model=Patient)
    async def create_patient(payload: PatientCreate = Body(...)):
        now = datetime.utcnow()
        full_name = payload.full_name or f"{payload.first_name} {payload.last_name}".strip()
        key = make_patient_key(payload.num_paciente, full_name, payload.phone)
        # Upsert by key: store the computed key to prevent duplicates
        doc = {
            "first_name": payload.first_name,
            "last_name": payload.last_name,
            "full_name": full_name,
            "phone": payload.phone,
            "email": payload.email,
            "address": payload.address,
            "num_paciente": payload.num_paciente,
            "notes": payload.notes,
            "key": key,
            "source": "manual",
            "created_at": now,
            "updated_at": now,
        }
        existing = await db.patients.find_one({"key": key})
        if existing:
            await db.patients.update_one({"_id": existing["_id"]}, {"$set": doc})
            existing.update(doc)
            existing["_id"] = str(existing["_id"])
            return Patient(**existing)
        result = await db.patients.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return Patient(**doc)

    @router.put("/{patient_id}", response_model=Patient)
    async def update_patient(patient_id: str, payload: PatientUpdate = Body(...)):
        # If patient exists manual -> update; if it's a derived id (uuid5), create or upsert manual by key
        full_name = payload.full_name or f"{payload.first_name} {payload.last_name}".strip()
        key = make_patient_key(payload.num_paciente, full_name, payload.phone)
        now = datetime.utcnow()
        doc_update = {
            "first_name": payload.first_name,
            "last_name": payload.last_name,
            "full_name": full_name,
            "phone": payload.phone,
            "email": payload.email,
            "address": payload.address,
            "num_paciente": payload.num_paciente,
            "notes": payload.notes,
            "key": key,
            "source": "manual",
            "updated_at": now,
        }
        existing = await db.patients.find_one({"_id": patient_id})
        if existing:
            await db.patients.update_one({"_id": patient_id}, {"$set": doc_update})
            existing.update(doc_update)
            existing["_id"] = str(existing["_id"])
            return Patient(**existing)
        # Upsert by key
        existing_by_key = await db.patients.find_one({"key": key})
        if existing_by_key:
            await db.patients.update_one({"_id": existing_by_key["_id"]}, {"$set": doc_update})
            existing_by_key.update(doc_update)
            existing_by_key["_id"] = str(existing_by_key["_id"])
            return Patient(**existing_by_key)
        # Create new manual entry
        doc_update["created_at"] = now
        result = await db.patients.insert_one(doc_update)
        doc_update["_id"] = str(result.inserted_id)
        return Patient(**doc_update)

    return router