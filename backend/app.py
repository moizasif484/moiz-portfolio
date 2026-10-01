"""
MOIZ ASIF — AI Portfolio Backend
Flask API with multi-provider AI support.
Environment variables: AI_API_KEY, AI_PROVIDER, ALLOWED_ORIGINS
"""

import os
import json
import logging
import time
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import portfolio knowledge base
from knowledge import PORTFOLIO_KNOWLEDGE, SYSTEM_PROMPT

# ──────────────────────────────────────────────
# App Setup
# ──────────────────────────────────────────────
app = Flask(__name__)

# CORS — allow configured origins or all in dev
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
CORS(app, origins=allowed_origins.split(",") if allowed_origins != "*" else "*")

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Config
# ──────────────────────────────────────────────
AI_API_KEY = os.getenv("AI_API_KEY", "")
AI_PROVIDER = os.getenv("AI_PROVIDER", "google").lower()  # google | openai | anthropic
MAX_MESSAGE_LENGTH = 1000
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 20     # requests per window

# Simple in-memory rate limiter
rate_limit_store: dict[str, list[float]] = {}


# ──────────────────────────────────────────────
# Rate Limiting
# ──────────────────────────────────────────────
def rate_limit(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        client_ip = request.remote_addr or "unknown"
        now = time.time()
        window_start = now - RATE_LIMIT_WINDOW

        # Clean old entries
        rate_limit_store[client_ip] = [
            t for t in rate_limit_store.get(client_ip, []) if t > window_start
        ]

        if len(rate_limit_store.get(client_ip, [])) >= RATE_LIMIT_MAX:
            return jsonify({"error": "Too many requests. Please slow down."}), 429

        rate_limit_store.setdefault(client_ip, []).append(now)
        return f(*args, **kwargs)
    return decorated


# ──────────────────────────────────────────────
# AI Provider Calls
# ──────────────────────────────────────────────
def call_google_gemini(message: str, history: list) -> str:
    """Call Google Gemini API."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=AI_API_KEY)
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=SYSTEM_PROMPT,
        )
        # Build history for multi-turn
        chat_history = []
        for turn in history[-10:]:  # Keep last 10 turns
            if turn.get("role") == "user":
                chat_history.append({"role": "user", "parts": [turn["content"]]})
            elif turn.get("role") == "assistant":
                chat_history.append({"role": "model", "parts": [turn["content"]]})

        chat = model.start_chat(history=chat_history)
        response = chat.send_message(message)
        return response.text
    except ImportError:
        raise ValueError("google-generativeai package not installed. Run: pip install google-generativeai")
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        raise


def call_openai(message: str, history: list) -> str:
    """Call OpenAI API."""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=AI_API_KEY)
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for turn in history[-10:]:
            if turn.get("role") in ("user", "assistant"):
                messages.append({"role": turn["role"], "content": turn["content"]})
        messages.append({"role": "user", "content": message})
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=500,
        )
        return response.choices[0].message.content
    except ImportError:
        raise ValueError("openai package not installed. Run: pip install openai")
    except Exception as e:
        logger.error(f"OpenAI error: {e}")
        raise


def call_anthropic(message: str, history: list) -> str:
    """Call Anthropic Claude API."""
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=AI_API_KEY)
        messages = []
        for turn in history[-10:]:
            if turn.get("role") in ("user", "assistant"):
                messages.append({"role": turn["role"], "content": turn["content"]})
        messages.append({"role": "user", "content": message})
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=500,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        return response.content[0].text
    except ImportError:
        raise ValueError("anthropic package not installed. Run: pip install anthropic")
    except Exception as e:
        logger.error(f"Anthropic error: {e}")
        raise


def get_ai_response(message: str, history: list) -> str:
    """Route to appropriate AI provider."""
    if not AI_API_KEY:
        return get_local_response(message)

    if AI_PROVIDER == "google":
        return call_google_gemini(message, history)
    elif AI_PROVIDER == "openai":
        return call_openai(message, history)
    elif AI_PROVIDER == "anthropic":
        return call_anthropic(message, history)
    else:
        return get_local_response(message)


def get_local_response(message: str) -> str:
    """Fallback local responses when no API key is configured."""
    msg = message.lower()
    p = PORTFOLIO_KNOWLEDGE

    if any(w in msg for w in ["who is moiz", "about moiz", "tell me about", "who are you"]):
        return (
            f"{p['name']} is a {p['age']}-year-old {p['role']}. "
            f"{p['bio']} You can reach him on WhatsApp: {p['contact']['whatsapp']}"
        )
    elif any(w in msg for w in ["jarvis", "project"]):
        j = p["projects"]["JARVIS"]
        return (
            f"JARVIS is {p['name']}'s flagship project — {j['description']} "
            f"Tech stack: {', '.join(j['tech_stack'][:4])}. "
            f"Check it out on GitHub: {j['github']}"
        )
    elif any(w in msg for w in ["service", "build", "can you make", "can you create"]):
        services = [s["title"] for s in p["services"]]
        return f"Moiz offers: {', '.join(services)}. Each is tailored to your specific needs. Want to start a project? Reach out on WhatsApp: {p['contact']['whatsapp']}"
    elif any(w in msg for w in ["hire", "work", "contact", "price", "cost", "how much"]):
        return f"{p['hiring']} You can also view the Contact page on the portfolio."
    elif any(w in msg for w in ["age", "old", "young", "student"]):
        return f"Moiz is {p['age']} years old, currently at {p['education']} level. He is entirely self-taught and building real AI projects."
    elif any(w in msg for w in ["tech", "stack", "language", "skill", "tool"]):
        ai_tech = ', '.join(p["technologies"]["AI"][:5])
        web_tech = ', '.join(p["technologies"]["Web"][:4])
        return f"AI Stack: {ai_tech}. Web Stack: {web_tech}. He focuses on practical, working implementations."
    elif any(w in msg for w in ["hello", "hi", "hey", "greetings"]):
        return f"Hello! I'm Moiz's AI Assistant. I can tell you about {p['name']}, his projects, services, or how to work with him. What would you like to know?"
    else:
        return (
            f"I don't have specific information about that yet. "
            f"You can contact Moiz directly on WhatsApp for detailed answers: {p['contact']['whatsapp']}"
        )


# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "online",
        "name": "Moiz AI Backend",
        "provider": AI_PROVIDER if AI_API_KEY else "local",
        "version": "1.0.0",
    })


@app.route("/api/chat", methods=["POST"])
@rate_limit
def chat():
    """Main AI chat endpoint."""
    # Validate request
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    message = data.get("message", "").strip()
    history = data.get("history", [])

    # Input validation
    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400
    if len(message) > MAX_MESSAGE_LENGTH:
        return jsonify({"error": f"Message too long. Max {MAX_MESSAGE_LENGTH} characters."}), 400
    if not isinstance(history, list):
        history = []

    # Sanitize history
    clean_history = []
    for turn in history[-20:]:  # Limit history to last 20 turns
        if isinstance(turn, dict) and turn.get("role") in ("user", "assistant") and isinstance(turn.get("content"), str):
            clean_history.append({
                "role": turn["role"],
                "content": turn["content"][:500]  # Limit each message
            })

    try:
        response_text = get_ai_response(message, clean_history)
        return jsonify({"response": response_text, "provider": AI_PROVIDER if AI_API_KEY else "local"})
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return jsonify({"error": "AI service is temporarily unavailable. Please try again."}), 503


@app.route("/api/contact", methods=["POST"])
@rate_limit
def contact():
    """Contact form submission endpoint."""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    name = str(data.get("name", "")).strip()
    message = str(data.get("message", "")).strip()

    # Validate
    if not name or len(name) < 2:
        return jsonify({"error": "Please provide a valid name."}), 400
    if not message or len(message) < 10:
        return jsonify({"error": "Please provide a message (at least 10 characters)."}), 400
    if len(name) > 100:
        return jsonify({"error": "Name is too long."}), 400
    if len(message) > 2000:
        return jsonify({"error": "Message is too long. Max 2000 characters."}), 400

    # Log the contact (in production, you'd send an email or WhatsApp notification)
    logger.info(f"Contact form: name={name[:50]}, message_len={len(message)}")

    return jsonify({
        "success": True,
        "message": "Message received. Moiz will respond within 2–4 hours via WhatsApp.",
        "whatsapp": PORTFOLIO_KNOWLEDGE["contact"]["whatsapp"],
    })


# ──────────────────────────────────────────────
# Error Handlers
# ──────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(500)
def internal_error(e):
    logger.error(f"Internal error: {e}")
    return jsonify({"error": "Internal server error"}), 500


# ──────────────────────────────────────────────
# Entry Point
# ──────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    logger.info(f"Starting Moiz AI Backend on port {port}, provider={AI_PROVIDER}")
    app.run(host="0.0.0.0", port=port, debug=debug)
