import os
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from datetime import date

# Let's import our models and crud functions
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from app.database import SessionLocal, current_tenant_var
from app.crud.appointments import get_availability_slots
from app import models

db = SessionLocal()

tenant_id = "00000000-0000-0000-0000-000000000001"
current_tenant_var.set(tenant_id)

# Let's check a service id
services = db.query(models.Service).filter(models.Service.tenant_id == tenant_id).all()
for s in services:
    print(f"Service: {s.name} (ID: {s.id}), Duration: {s.duration_minutes}")

service_id = services[0].id

# Let's check locations
locations = db.query(models.Location).filter(models.Location.tenant_id == tenant_id, models.Location.is_active == True).all()
for loc in locations:
    print(f"Location: {loc.name} (ID: {loc.id})")

location_id = locations[0].id

print("\n--- Testing get_availability_slots ---")
for offset in [0, 1, 2, 5]:
    test_date = date(2026, 6, 15 + offset)
    slots = get_availability_slots(db, target_date=test_date, service_id=service_id, location_id=location_id)
    print(f"Date {test_date} -> {len(slots)} slots found: {slots}")
