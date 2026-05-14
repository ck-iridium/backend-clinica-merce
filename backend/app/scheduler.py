from apscheduler.schedulers.asyncio import AsyncIOScheduler

# Usamos MemoryJobStore para la versión 1.0 ya que es suficiente para el bloqueo de 15 minutos.
scheduler = AsyncIOScheduler()
