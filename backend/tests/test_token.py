from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine
from app.models.token import TokenTransaction

client = TestClient(app)
Base.metadata.create_all(bind=engine)

def test_transfer_and_balance():
    resp = client.post("/api/transfer-tokens", json={
        "from_user_id": "user1", "to_user_id": "user2", "amount": 50
    })
    assert resp.status_code == 200
    assert resp.json()["status"] == "success"
    bal = client.get("/api/balance/user2")
    assert bal.json()["balance"] == 50.0
