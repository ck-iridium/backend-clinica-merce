import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ... import database
from ...crud.settings import get_clinic_settings
from ...services.stripe_service import StripeService

router = APIRouter()

@router.post("/connect")
def connect_stripe_account(db: Session = Depends(database.get_db)):
    settings = get_clinic_settings(db)
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    
    if not settings.stripe_account_id:
        account_id = StripeService.create_connect_account(settings.clinic_email or None)
        settings.stripe_account_id = account_id
        db.commit()

    url = StripeService.create_connect_account_link(settings.stripe_account_id, frontend_url)
    return {"url": url}


@router.get("/refresh-status")
def refresh_stripe_status(db: Session = Depends(database.get_db)):
    settings = get_clinic_settings(db)
    if not settings.stripe_account_id:
        return {"status": "no_account"}
        
    charges_enabled = StripeService.retrieve_connect_account_charges_enabled(settings.stripe_account_id)
    settings.stripe_charges_enabled = charges_enabled
    db.commit()
    return {"charges_enabled": settings.stripe_charges_enabled}
