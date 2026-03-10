from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_checkout_session():
    response = client.post("/api/create-checkout-session", json={
        "token_amount": 100,
        "success_url": "http://localhost:5173/success",
        "cancel_url": "http://localhost:5173/cancel"
    })
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert data["url"] == "https://checkout.stripe.com/mock"
