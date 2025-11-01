import webview
import threading
import time
import os
import datetime
import json
from helper import get_user, update_user, get_credentials, update_credentials, get_data, reset_data
from email_helper import send_email, check_bounce
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from urllib.parse import quote
import re
from wp_helper import send_message
import requests

APP_VERSION = "1.0.0"
UPDATE_CHECK_URL = "http://127.0.0.1:8000/api/latest_version"  # ← replace with your API


SETTINGS_FILE = "settings.json"

class API:
    def __init__(self, window):
        self.window = window

    def load_user_info(self):
        user = get_user()
        credentials = get_credentials()
        return {"user": user, "credentials": credentials}
    
    def update_user_info(self, username, password):
        """Update user info from JS login"""
        update_user(username=username, password=password)
        return {"status": "success", "message": "User info updated"}
    
    def update_credentials(self, settings=None, *args, **kwargs):
        """
        Update credentials from JS. Accepts either:
          - a single positional dict (from JS object), or
          - keyword arguments.

        This is flexible because pywebview passes a JS object as a positional
        argument rather than keyword args.
        """
        # If a positional settings dict was passed from JS, use it
        if isinstance(settings, dict) and settings:
            result = update_credentials(**settings)
            return result

        # Otherwise, if kwargs were provided, use them
        if kwargs:
            result = update_credentials(**kwargs)
            return result

        # Nothing to update
        return {"status": "error", "message": "No credentials provided"}

    def _safe_evaluate(self, script):
        """Evaluate JS in the webview and catch errors so background threads don't crash.

        Logs any exception to stdout and returns False on failure, True on success.
        """
        try:
            self.window.evaluate_js(script)
            return True
        except Exception as e:
            # Keep this lightweight; don't re-raise from background thread.
            print(f"evaluate_js failed for script: {script!r} -> {e}")
            return False

    def send_sms(self, recipients, channel, delay, settings):
        """
        Called from JS to schedule sending SMS or messages.
        """
        # ✅ Extract recipient names or emails safely
        recipient_list = [r.get('name', r.get('email', 'Unknown')) for r in recipients if isinstance(r, dict)]
        recipients_str = ", ".join(recipient_list)

        print(f"Scheduling message to {recipients_str} via {channel} after {delay} seconds... {settings}")

        # ❌ Original code: started the function immediately instead of passing it
        # threading.Thread(target=self._delayed_send(recipients, channel, delay), daemon=True).start()
        # ✅ Fixed: pass callable, not function result
        threading.Thread(target=self._delayed_send, args=(recipients, channel, delay, settings), daemon=True).start()

        return f"Scheduled {len(recipient_list)} messages via {channel}"

    def _delayed_send(self, recipients, channel, delay, settings):
        """Handles the delayed message sending in a background thread."""
        # 🧩 Convert milliseconds to seconds if delay > 10 (assume it's ms)
        if delay > 10:
            delay = delay / 1000

        print(f"Waiting {delay} seconds before sending...")
        time.sleep(delay)
        Total = len(recipients)
        i = 0
        # self.window.evaluate_js(f"update_Progress({i}, {Total})")

        if channel == 'email':
            for recipient in recipients:
                i += 1
                name = recipient.get('name', 'Unknown')
                to_email = recipient.get('email', None)
                email_subject = recipient.get('emailTitle', '')
                email_body = recipient.get('emailContent', '')
                email_password = settings.get('appPassword', '')
                from_email = settings.get('senderEmail', '')

                print(f"Sent message to {name} via {channel}")
                safe_name = name.replace("'", "\\'")

                if send_email(from_email, email_password, to_email, email_subject, email_body):
                    bounced = check_bounce(from_email, email_password)
                    if to_email in bounced:
                        print(f"❌ Email to {to_email} bounced!")
                        self._safe_evaluate(f"update_server_status({recipient.get('id')}, 'Bounced', null)")
                        self._safe_evaluate(f"add_Log('❌ Email to {to_email} bounced!', 'error')")
                    else:
                        print("✅ Email delivered successfully.")
                        self._safe_evaluate(f"update_server_status({recipient.get('id')}, 'Delivered', null)")
                        self._safe_evaluate(f"add_Log('✅ Email {to_email} delivered successfully.', 'success')")
                
                self._safe_evaluate(f"add_Log('Sent message to {to_email} via {channel}')")

                self._safe_evaluate(f"update_Progress({i}, {Total})")
        else:
            user_path = settings.get('userDataPath', '')
            print(user_path)
            user_path = user_path.replace('\\', '/')

            options = webdriver.ChromeOptions()
            options.add_argument("--start-maximized")  # Open Chrome in maximized mode

            options.add_argument("--disable-gpu")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--no-sandbox")
            options.add_argument("--remote-debugging-port=9222")  # Debugging mode
            options.add_argument(f"user-data-dir={user_path}") # Uncomment if needed

            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)

            driver.get('https://web.whatsapp.com')
            time.sleep(5)

            result = webview.windows[0].create_confirmation_dialog(
                        "Confirm WhatsApp Login",
                        "Please scan the QR code on WhatsApp Web and click OK once you're logged in.\n\nContinue?"
                    )
            
            if not result:
                print("❌ User canceled WhatsApp send.")
                self._safe_evaluate("add_Log('You canceled WhatsApp sending.', 'warning')")
                driver.close()
                return
            # show di

            # # Wait up to 10 minutes (600 seconds) for the Profile button to appear
            # try:
            #     # Wait for up to 10 minutes (600 seconds)
            #     profile_button = WebDriverWait(driver, 600).until(
            #         EC.presence_of_element_located((By.XPATH, "//button[@aria-label='Profile']"))
            #     )
            #     print("✅ Profile button appeared!")
            # except Exception as e:
            #     print("❌ Error:", e)
            # profile_button.click()

            # profile_details = driver.find_element(By.CLASS_NAME, 'copyable-area')
            # text = profile_details.text
            # user_no = settings.get('whatsappNumber', '')

            # # extract all digits from the text
            # digits = re.sub(r'\D', '', text)
            
            # if user_no in digits:
            # print("✅ Number found")                  

            for recipient in recipients:
                i += 1
                name = recipient.get('name', 'Unknown')
                to_phone = recipient.get('phone', None)
                phone_content = recipient.get('wp_content', '')
                if send_message(driver, to_phone, phone_content):
                    print(f"Sent message to {name} via {channel}")
                    safe_name = name.replace("'", "\\'")
                    self._safe_evaluate(f"add_Log('Sent message to {to_phone} via {channel}', 'success')")
                    self._safe_evaluate(f"update_server_status({recipient.get('id')}, '', 'Delivered')")
                else:
                    self._safe_evaluate(f"add_Log('Failed to send message to {to_phone} via {channel}', 'error')")
                    self._safe_evaluate(f"update_server_status({recipient.get('id')}, '', 'Failed')")

                self._safe_evaluate(f"update_Progress({i}, {Total})")

            # else:
            #     print("❌ Number not found")   
            #     self._safe_evaluate(f"add_Log('❌ Sender number {user_no} not found in WhatsApp.', 'error')")

            driver.close()

        self._safe_evaluate(f"add_Log('All messages were delivered successfully.', 'success')")

    def save_logs(self, text):
        try:
            folder = os.path.join(os.getcwd(), "logs")
            os.makedirs(folder, exist_ok=True)

            filename = f"messaginghub_logs_{datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.txt"
            filepath = os.path.join(folder, filename)

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(text)

            return {"status": "success", "path": filepath}
        except Exception as e:
            return {"status": "error", "message": str(e)}
        
    def save_settings(self, settings):
        with open(SETTINGS_FILE, "w") as f:
            json.dump(settings, f, indent=4)
        return "Settings saved to file"

    def load_settings(self):
        if os.path.exists(SETTINGS_FILE):
            with open(SETTINGS_FILE, "r") as f:
                return json.load(f)
        return {}
    

def check_for_updates():
    """Check for updates before starting the app UI."""
    print("🔍 Checking for updates...")
    try:
        response = requests.get(UPDATE_CHECK_URL, timeout=5)
        if response.status_code == 200:
            data = response.json()
            latest_version = data.get("version")
            download_url = data.get("download_url")

            if latest_version and latest_version != APP_VERSION:
                message = f"""
                    <style>
                        body {{
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            text-align: center;
                        }}
                        .update-message {{
                            margin-bottom: 20px;
                            font-size: 16px;
                        }}
                        .download-link {{
                            display: inline-block;
                            padding: 10px 20px;
                            background-color: #4CAF50;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            transition: background-color 0.3s;
                        }}
                        .download-link:hover {{
                            background-color: #45a049;
                        }}
                    </style>
                    <div class="update-message">
                        A new version ({latest_version}) is available!
                    </div>
                    <a href="{download_url}" class="download-link" target="_blank">
                        Download Update
                    </a>
                    """
                # create a small temporary window for alert
                temp_window = webview.create_window("Update Available", html=message, width=400, height=200)
                webview.start(gui='edgechromium')
                return False  # stop startup
            else:
                print("✅ App is up to date.")
                return True
        else:
            print(f"⚠️ Version check failed: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"⚠️ Could not check for updates: {e}")
        return False


def start_app():
    """Start the main app only if update check passes."""
    if not check_for_updates():
        print("❌ Version check failed or outdated — closing app.")
        return  # Do not launch the main window

    window = webview.create_window(
        "Message Sender",
        "SimpleMailWP/index.html"
    )

    api = API(window)

    # ✅ Expose API methods
    window.expose(api.send_sms)
    window.expose(api.update_user_info)
    window.expose(api.update_credentials)
    window.expose(api.save_logs)
    window.expose(api.save_settings)
    window.expose(api.load_settings)
    window.expose(api.load_user_info)

    def on_loaded():
        print("Window loaded and ready.")

    webview.settings['ALLOW_DOWNLOADS'] = True
    window.events.loaded += lambda: window.maximize()

    webview.start(on_loaded, debug=True, http_server=True, gui='edgechromium')


if __name__ == "__main__":
    start_app()
