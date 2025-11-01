from loguru import logger
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from urllib.parse import quote
import re

logger.add("whatsapp_log_{time:YYYY-MM-DD}.log", rotation="500 MB", level="TRACE")

def send_message(driver, phone_number, message):
    try:
        encoded_message = quote(message)
        url = f'https://web.whatsapp.com/send?phone={phone_number}&text={encoded_message}'
        driver.get(url)

        logger.info(f"Opening chat for {phone_number}")

        try:
            send_button = WebDriverWait(driver, 30).until(
                        EC.element_to_be_clickable(
                            (By.XPATH, "//div[@aria-label='Send']")
                        )
                    )
        except Exception as e:
            logger.error(f"Message could not be sent to {phone_number}: {e}")
            return False
        else:
            time.sleep(2)
            send_button.click()
            time.sleep(5)
            logger.info(f"Message sent to {phone_number}")
            return True
    except Exception as e:
        logger.error(f"Failed to send message to {phone_number}: {e}")
        return False


# options = webdriver.ChromeOptions()
# options.add_argument("--start-maximized")  # Open Chrome in maximized mode

# options.add_argument("--disable-gpu")
# options.add_argument("--disable-dev-shm-usage")
# options.add_argument("--no-sandbox")
# options.add_argument("--remote-debugging-port=9222")  # Debugging mode
# # options.add_argument("user-data-dir=C:/Users/YOUR_USER/AppData/Local/Google/Chrome/User Data") # Uncomment if needed

# service = Service(ChromeDriverManager().install())
# driver = webdriver.Chrome(service=service, options=options)

# driver.get('https://web.whatsapp.com')
# time.sleep(10)

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
# user_no = "9735877857"

# # extract all digits from the text
# digits = re.sub(r'\D', '', text)

# if user_no in digits:
#     print("✅ Number found")
    
#     phone_numbers = [7679735335,9735877857]
#     message = 'Hello, this is a test message'

#     for phone in phone_numbers:
#         send_message(driver, phone, message)

# else:
#     print("❌ Number not found")

# driver.close()

