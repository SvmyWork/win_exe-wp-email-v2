import json
import os

DB_FILE = "data.json"

# Default structure for new file
DEFAULT_DATA = {
    "users": {
        "username": "",
        "password": ""
    },
    "credentials": {
        "senderEmail": "",
        "senderName": "",
        "appPassword": "",
        "emailTracking": False,
        "whatsappNumber": "",
        "whatsappBusinessName": "",
        "userDataPath": "",
        "whatsappReceipts": False,
        "messageDelay": "0",
        "autoSave": False,
        "notifications": False
    }
}


# 🔹 Initialize the JSON file if missing
def _init_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w") as f:
            json.dump(DEFAULT_DATA, f, indent=4)


# 🔹 Load the JSON file
def _load_db():
    _init_db()
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, ValueError):
        # File is empty or invalid, reset to default
        with open(DB_FILE, "w") as f:
            json.dump(DEFAULT_DATA, f, indent=4)
        return DEFAULT_DATA.copy()


# 🔹 Save back to JSON
def _save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)


# ======================================================
# 📘 Public Helper Functions
# ======================================================

def get_data():
    """Return the full data object"""
    return _load_db()


def get_user():
    """Return user login info"""
    db = _load_db()
    return db.get("users", {})


def update_user(username=None, password=None):
    """Update username or password"""
    db = _load_db()
    if username:
        db["users"]["username"] = username
    if password:
        db["users"]["password"] = password
    _save_db(db)
    return {"status": "success", "message": "User updated!"}


def get_credentials():
    """Return sender credentials"""
    db = _load_db()
    return db.get("credentials", {})


def update_credentials(**kwargs):
    """
    Update one or more credential fields dynamically.
    Example:
        update_credentials(senderEmail="new@gmail.com", autoSave=True)
    """
    db = _load_db()
    creds = db["credentials"]
    for key, value in kwargs.items():
        if key in creds:
            creds[key] = value
    _save_db(db)
    return {"status": "success", "message": "Credentials updated!"}


def reset_data():
    """Reset database to default structure"""
    _save_db(DEFAULT_DATA)
    return {"status": "success", "message": "Database reset to default."}
