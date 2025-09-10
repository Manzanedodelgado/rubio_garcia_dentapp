import asyncio
import aiohttp
import csv
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from motor.motor_asyncio import AsyncIOMotorClient
import os

logger = logging.getLogger(__name__)

class GoogleSheetsService:
    def __init__(self, db_client: AsyncIOMotorClient):
        self.db = db_client[os.environ['DB_NAME']]
        self.sheet_url = "https://docs.google.com/spreadsheets/d/1MBDBHQ08XGuf5LxVHCFhHDagIazFkpBnxwqyEQIBJrQ/export?format=csv"
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