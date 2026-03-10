from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_lightning_invoice():
    response = client.post("/api/create-lightning-invoice", json={
        "token_amount": 100,
        "description": "Test purchase"
    })
    # Without API key, we get mock response
    assert response.status_code == 200
    data = response.json()
    assert "invoice" in data
