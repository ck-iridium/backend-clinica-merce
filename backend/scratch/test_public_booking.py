import os
import sys
from datetime import datetime

# Add current directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import models, schemas, database
from app.crud.appointments import create_public_appointment
from app.database import SessionLocal, current_tenant_var

def test():
    # Set active tenant
    current_tenant_var.set("00000000-0000-0000-0000-000000000001")
    
    db = SessionLocal()
    try:
        # Get first active service to test with
        service = db.query(models.Service).filter(models.Service.is_active == True).first()
        if not service:
            print("No active service found to test!")
            return
            
        print(f"Testing public booking for service: {service.name} (ID: {service.id})")
        
        # Create a mock request
        booking = schemas.PublicBookingRequest(
            service_id=service.id,
            start_time=datetime.now(),
            client_name="Test User",
            client_email="test_user@example.com",
            client_phone="600000000",
            service_modality="clinic"
        )
        
        appt, client, is_new = create_public_appointment(db, booking, send_email=False)
        print("SUCCESS!")
        print(f"Appointment ID: {appt.id}")
        print(f"Client: {client.name} (is_new: {is_new})")
    except Exception as e:
        import traceback
        print(f"FAILED with error: {e}")
        print(traceback.format_exc())
    finally:
        db.close()

if __name__ == "__main__":
    test()
