import os
from fastapi import FastAPI
from dotenv import load_dotenv
import sentry_sdk
from supabase import create_client, Client

load_dotenv()

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    traces_sample_rate=1.0,
)

app = FastAPI(title="HuhlyHub API")

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)

@app.get("/")
def read_root():
    return {"message": "HuhlyHub Backend"}

@app.get("/health")
def health():
    return {"status": "ok"}
