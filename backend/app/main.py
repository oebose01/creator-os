from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import stripe, lightning, token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stripe.router)
app.include_router(lightning.router)
app.include_router(token.router)

@app.get("/")
async def root():
    return {"message": "HuhlyHub API is running"}
