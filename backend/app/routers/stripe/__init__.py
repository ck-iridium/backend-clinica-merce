from fastapi import APIRouter
from .onboarding import router as onboarding_router
from .billing import router as billing_router
from .connect import router as connect_router
from .appointments import router as appointments_router
from .webhooks import router as webhooks_router

router = APIRouter(
    prefix="/stripe",
    tags=["stripe"],
)

router.include_router(onboarding_router)
router.include_router(billing_router)
router.include_router(connect_router)
router.include_router(appointments_router)
router.include_router(webhooks_router)
