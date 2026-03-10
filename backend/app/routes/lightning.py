from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

router = APIRouter(prefix="/api", tags=["lightning"])

class LightningInvoiceRequest(BaseModel):
    token_amount: int
    description: str = "HuhlyCoin purchase"

@router.post("/create-lightning-invoice")
async def create_lightning_invoice(req: LightningInvoiceRequest):
    # Always return mock invoice (real integration later)
    return {"invoice": "lnbc100...", "id": "mock_id"}
