from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import List, Optional
from datetime import datetime, date, timedelta
from ..models.appointment import Appointment, AppointmentStats, SyncResult
from ..services.google_sheets_service import GoogleSheetsService
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/appointments", tags=["appointments"])

# Initialize Google Sheets service
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
sheets_service = GoogleSheetsService(client)

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
        raise HTTPException(status_code=500, detail=f"Error fetching appointments: {str(e)}")

@router.get("/today", response_model=List[Appointment])
async def get_today_appointments():
    """Get today's appointments"""
    today = date.today().strftime('%Y-%m-%d')
    try:
        appointments = await sheets_service.get_appointments(start_date=today, end_date=today)
        return appointments
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching today's appointments: {str(e)}")

@router.get("/stats", response_model=AppointmentStats)
async def get_appointment_stats():
    """Get appointment statistics"""
    try:
        db = sheets_service.db
        
        # Get all appointments
        total = await db.appointments.count_documents({"source": "google_sheets"})
        
        # Today's appointments
        today = date.today().strftime('%Y-%m-%d')
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
        
        return AppointmentStats(
            total_appointments=total,
            today_appointments=today_count,
            confirmed_appointments=confirmed,
            pending_appointments=pending,
            completed_appointments=completed,
            cancelled_appointments=cancelled
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@router.post("/sync", response_model=SyncResult)
async def sync_appointments():
    """Manually trigger sync from Google Sheets"""
    try:
        result = await sheets_service.sync_appointments()
        return SyncResult(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

@router.get("/sync/status")
async def get_sync_status():
    """Get last sync information"""
    return {
        "last_update": sheets_service.last_update.isoformat() if sheets_service.last_update else None,
        "auto_sync_active": True,
        "sync_interval_minutes": 5
    }

@router.get("/upcoming", response_model=List[Appointment])
async def get_upcoming_appointments(days: int = Query(7, description="Number of days ahead")):
    """Get upcoming appointments for the next N days"""
    try:
        start_date = date.today().strftime('%Y-%m-%d')
        end_date = (date.today() + timedelta(days=days)).strftime('%Y-%m-%d')
        
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
        raise HTTPException(status_code=500, detail=f"Error fetching upcoming appointments: {str(e)}")

# Background task to start auto-sync
async def start_background_sync():
    """Start the background sync process"""
    import asyncio
    asyncio.create_task(sheets_service.start_auto_sync(interval_minutes=5))