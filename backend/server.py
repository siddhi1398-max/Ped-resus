from fastapi import FastAPI, APIRouter, Request, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionRequest,
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', '')

# Fixed price packages (server-defined to prevent price manipulation)
# NOTE: Stripe enforces a minimum charge of ~$0.50 USD equivalent.
# ₹20 converts to ~$0.21 and is rejected. Using ₹50 (~$0.59) as the floor.
PRICE_PACKAGES = {
    "lifetime_unlock": {"amount": 50.00, "currency": "inr", "label": "Ped.Resus lifetime PDF unlock"},
}

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root() -> dict[str, str]:
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate) -> StatusCheck:
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks() -> List[StatusCheck]:
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# ═══════════════════════════════════════════════════════════════
# Stripe one-time purchase (lifetime PDF unlock)
# ═══════════════════════════════════════════════════════════════
class CheckoutRequest(BaseModel):
    origin_url: str
    email: EmailStr


class RestoreRequest(BaseModel):
    email: EmailStr


@api_router.post("/payments/create-checkout")
async def create_checkout(req: CheckoutRequest, http_request: Request) -> dict:
    if not STRIPE_API_KEY:
        raise HTTPException(500, "Stripe not configured")

    pkg = PRICE_PACKAGES["lifetime_unlock"]
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    success_url = f"{req.origin_url}?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = req.origin_url

    session_req = CheckoutSessionRequest(
        amount=pkg["amount"],
        currency=pkg["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"email": req.email, "package": "lifetime_unlock"},
    )
    session = await checkout.create_checkout_session(session_req)

    # Create pending transaction record
    txn_doc = {
        "session_id": session.session_id,
        "email": req.email,
        "amount": pkg["amount"],
        "currency": pkg["currency"],
        "package": "lifetime_unlock",
        "payment_status": "pending",
        "status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.insert_one(txn_doc)

    return {"url": session.url, "session_id": session.session_id}


@api_router.get("/payments/checkout-status/{session_id}")
async def checkout_status(session_id: str) -> dict:
    if not STRIPE_API_KEY:
        raise HTTPException(500, "Stripe not configured")

    checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    status = await checkout.get_checkout_status(session_id)

    # Atomic single-update on success
    existing = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if existing and existing.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": status.status,
                "payment_status": status.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )

    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
        "email": status.metadata.get("email", "") if status.metadata else "",
    }


@api_router.post("/payments/restore-by-email")
async def restore_by_email(req: RestoreRequest) -> dict:
    txn = await db.payment_transactions.find_one(
        {"email": req.email, "payment_status": "paid"},
        {"_id": 0},
        sort=[("created_at", -1)],
    )
    if txn:
        return {"unlocked": True, "session_id": txn["session_id"]}
    return {"unlocked": False, "session_id": None}


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request) -> dict:
    if not STRIPE_API_KEY:
        return {"ok": False}
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    try:
        event = await checkout.handle_webhook(body, sig)
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        return {"ok": False}

    # Only process once per session_id
    if event.session_id:
        existing = await db.payment_transactions.find_one(
            {"session_id": event.session_id}, {"_id": 0}
        )
        if existing and existing.get("payment_status") != "paid":
            await db.payment_transactions.update_one(
                {"session_id": event.session_id},
                {"$set": {
                    "payment_status": event.payment_status,
                    "status": "completed" if event.payment_status == "paid" else event.payment_status,
                    "event_id": event.event_id,
                    "event_type": event.event_type,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }},
            )

    return {"ok": True}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client() -> None:
    client.close()