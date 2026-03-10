from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import stripe
import os
from dotenv import load_dotenv

load_dotenv()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

router = APIRouter(prefix="/api", tags=["checkout"])

class CheckoutSessionRequest(BaseModel):
    token_amount: int = 100  # Default 100 tokens
    success_url: str
    cancel_url: str

@router.post("/create-checkout-session")
async def create_checkout_session(request: CheckoutSessionRequest):
    try:
        # For now, just return a mock URL (replace with real Stripe logic later)
        # In production, you'd create a Stripe Checkout Session and return its URL.
        # For TDD, we return a dummy URL.
        # TODO: Implement actual Stripe session creation.
        dummy_url = "https://checkout.stripe.com/mock"
        return {"url": dummy_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
