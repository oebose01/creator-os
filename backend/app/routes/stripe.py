from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import stripe
import os
from dotenv import load_dotenv

load_dotenv()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
router = APIRouter(prefix="/api", tags=["stripe"])

class StripeCheckoutRequest(BaseModel):
    token_amount: int
    success_url: str
    cancel_url: str

@router.post("/create-stripe-checkout")
async def create_stripe_checkout(req: StripeCheckoutRequest):
    try:
        unit_amount = req.token_amount * 1  # .01 per token
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {'name': f'{req.token_amount} HuhlyCoins'},
                    'unit_amount': unit_amount,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=req.success_url,
            cancel_url=req.cancel_url,
            metadata={'token_amount': req.token_amount}
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
