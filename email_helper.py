import smtplib
import imaplib
import email
import time
import re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


# ==========================
# CONFIGURATION
# ==========================
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
IMAP_SERVER = "imap.gmail.com"
IMAP_PORT = 993
EMAIL_REGEX = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"


# ==========================
# SEND EMAIL FUNCTION
# ==========================
def send_email(email_address, email_password, to_email, subject, body):
    """
    Send an email using SMTP (Gmail).
    Returns True if sent successfully, False otherwise.
    """
    msg = MIMEMultipart()
    msg["From"] = email_address
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(email_address, email_password)
            response = server.sendmail(email_address, to_email, msg.as_string())

            if response == {}:
                print("✅ Email sent successfully!")
                return True
            else:
                print(f"⚠️ Email may have failed to send: {response}")
                return False

    except smtplib.SMTPRecipientsRefused:
        print("❌ Email bounced: Invalid recipient address.")
        return False
    except smtplib.SMTPAuthenticationError:
        print("❌ Authentication error: Check email/password.")
        return False
    except smtplib.SMTPException as e:
        print(f"❌ SMTP error: {e}")
        return False


# ==========================
# CHECK BOUNCE FUNCTION
# ==========================
def check_bounce(email_address, email_password, sender_email="mailer-daemon@googlemail.com", wait_time=30):
    """
    Wait for 'wait_time' seconds and check for bounce-back emails
    from the specified sender (usually mailer-daemon).
    Returns list of bounced email addresses (if any).
    """
    print(f"⏳ Waiting {wait_time} seconds for possible bounce emails...")
    time.sleep(wait_time)

    bounced_addresses = []

    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
        mail.login(email_address, email_password)
        mail.select("inbox")

        result, data = mail.search(None, f'(UNSEEN FROM "{sender_email}")')
        if result != "OK":
            print("⚠️ Failed to search inbox.")
            mail.logout()
            return []

        if data[0]:
            for num in data[0].split():
                _, msg_data = mail.fetch(num, "(RFC822)")

                for response_part in msg_data:
                    if isinstance(response_part, tuple):
                        msg = email.message_from_bytes(response_part[1])

                        body = ""
                        if msg.is_multipart():
                            for part in msg.walk():
                                if part.get_content_type() == "text/plain":
                                    body = part.get_payload(decode=True).decode(errors="ignore")
                                    break
                        else:
                            body = msg.get_payload(decode=True).decode(errors="ignore")

                        bounced = re.findall(EMAIL_REGEX, body)
                        bounced_addresses.extend(bounced)

            print(f"📩 Bounced addresses detected: {set(bounced_addresses)}")

        else:
            print("✅ No bounce-back emails detected. Email likely delivered.")

        mail.logout()
        return list(set(bounced_addresses))

    except imaplib.IMAP4.error as e:
        print(f"❌ IMAP error: {e}")
        return []


# ==========================
# MAIN TEST (Optional)
# ==========================
# if __name__ == "__main__":
#     EMAIL_ADDRESS = "svmypaul.cob420@gmail.com"
#     EMAIL_PASSWORD = "psgtnzytgcieauts"  # App password only
#     TO_EMAIL = "shubhamoypaul@zohomail.in"

#     if send_email(EMAIL_ADDRESS, EMAIL_PASSWORD, TO_EMAIL, "Test Email", "This is a test email."):
#         bounced = check_bounce(EMAIL_ADDRESS, EMAIL_PASSWORD)
#         if TO_EMAIL in bounced:
#             print(f"❌ Email to {TO_EMAIL} bounced!")
#         else:
#             print("✅ Email delivered successfully.")
