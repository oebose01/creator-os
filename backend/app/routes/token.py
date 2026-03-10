from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models.token import TokenTransaction
from app.database import SessionLocal

router = APIRouter(prefix="/api", tags=["token"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class TransferRequest(BaseModel):
    from_user_id: str
    to_user_id: str
    amount: float
    description: str = ""

@router.post("/transfer-tokens")
async def transfer_tokens(req: TransferRequest, db: Session = Depends(get_db)):
    sender = TokenTransaction(
        user_id=req.from_user_id, amount=-req.amount,
        transaction_type='transfer_out', description=req.description
    )
    recipient = TokenTransaction(
        user_id=req.to_user_id, amount=req.amount,
        transaction_type='transfer_in', description=req.description
    )
    db.add(sender); db.add(recipient); db.commit()
    return {"status": "success", "amount": req.amount}

@router.get("/balance/{user_id}")
async def get_balance(user_id: str, db: Session = Depends(get_db)):
    from sqlalchemy import func
    balance = db.query(func.sum(TokenTransaction.amount)).filter(TokenTransaction.user_id == user_id).scalar() or 0.0
    return {"user_id": user_id, "balance": balance}
