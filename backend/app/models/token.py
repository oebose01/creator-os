from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class TokenTransaction(Base):
    __tablename__ = 'token_transactions'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    amount = Column(Float)
    transaction_type = Column(String)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    reference_id = Column(String, nullable=True)
