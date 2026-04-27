"""Backend API tests for PED.RESUS app.

Covers:
- /api/ root returns 200 with PED.RESUS message
- /api/status POST + GET roundtrip (data persistence)
- /api/payments/* endpoints should NOT exist (app has no paywall)
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback: read from frontend .env if env var is not exposed to pytest
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except FileNotFoundError:
        pass

assert BASE_URL, "REACT_APP_BACKEND_URL must be set"


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Root API ----------
class TestRoot:
    def test_root_ok(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/", timeout=15)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert "message" in data
        assert "PED.RESUS" in data["message"], f"Expected PED.RESUS branding, got: {data}"


# ---------- Status endpoint ----------
class TestStatus:
    def test_create_and_list_status(self, api_client):
        client_name = f"TEST_{uuid.uuid4().hex[:8]}"
        r = api_client.post(
            f"{BASE_URL}/api/status",
            json={"client_name": client_name},
            timeout=15,
        )
        assert r.status_code == 200, f"POST /api/status failed: {r.status_code} {r.text}"
        created = r.json()
        assert created["client_name"] == client_name
        assert "id" in created and isinstance(created["id"], str) and len(created["id"]) > 0
        assert "timestamp" in created

        # GET and verify persistence
        r2 = api_client.get(f"{BASE_URL}/api/status", timeout=15)
        assert r2.status_code == 200
        items = r2.json()
        assert isinstance(items, list)
        names = [it.get("client_name") for it in items]
        assert client_name in names, "Newly created status check not returned in GET list"

        # Ensure no mongo _id leak
        for it in items:
            assert "_id" not in it, "MongoDB _id leaked in /api/status response"


# ---------- Payments must NOT exist ----------
class TestNoPayments:
    @pytest.mark.parametrize(
        "path",
        [
            "/api/payments",
            "/api/payments/",
            "/api/payments/checkout",
            "/api/payments/checkout/session",
            "/api/payments/webhook",
            "/api/payments/status",
        ],
    )
    def test_payments_endpoints_removed(self, api_client, path):
        r = api_client.get(f"{BASE_URL}{path}", timeout=15)
        assert r.status_code == 404, (
            f"{path} should be removed (404), got {r.status_code}: {r.text[:200]}"
        )

    def test_payments_post_removed(self, api_client):
        r = api_client.post(
            f"{BASE_URL}/api/payments/checkout/session",
            json={"package_id": "unlock"},
            timeout=15,
        )
        assert r.status_code in (404, 405), (
            f"POST to /api/payments should be gone, got {r.status_code}"
        )
