from flask import Flask, request
import requests
import json
import os
import redis
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)

API_BASE_URL = os.getenv("API_BASE_URL", "https://api-nine-murex.vercel.app")
REDIS_URL = os.getenv("REDIS_URL")

if REDIS_URL:
    redis_client = redis.from_url(REDIS_URL)
else:
    redis_client = None

@app.route('/', methods=['GET'])
def home():
    return "USSD Service is running!", 200

@app.route('/ussd', methods=['POST'])
def ussd_callback():
    session_id = request.form.get('sessionId')
    service_code = request.form.get('serviceCode')
    phone_number = request.form.get('phoneNumber')
    text = request.form.get('text')

    user_response = text.strip().split('*')
    response = ""

    # Format phone number to match API expectations
    formatted_phone = phone_number
    if phone_number.startswith('+') and phone_number[1:].isdigit():
        pass
    elif phone_number.startswith('0'):
        formatted_phone = '+250' + phone_number[1:]
    elif phone_number.isdigit():
        formatted_phone = '+250' + phone_number

    # Retrieve token and user_id from Redis if available
    user_session_data = {}
    if redis_client:
        stored_data = redis_client.get(session_id)
        if stored_data:
            user_session_data = json.loads(stored_data)
    
    user_token = user_session_data.get('token')
    user_id = user_session_data.get('user_id')
    user_name = user_session_data.get('user_name', '')

    if text == "":
        # Main menu
        response = "CON Murakaza neza kuri ConnectCare\n"
        response += "1. Kwiyandikisha\n"
        response += "2. Kwinjira"
        
    elif user_response[0] == "1":  # Registration flow
        if len(user_response) == 1:
            response = "CON Andika amazina yawe yose:"
        elif len(user_response) == 2:
            response = "CON Andika ijambo ry'ibanga (nibura inyuguti 8, harimo inyuguti nto, nini n'imibare):"
        elif len(user_response) == 3:
            full_name = user_response[1]
            password = user_response[2]

            try:
                register_data = {
                    "full_name": full_name,
                    "phone": formatted_phone,
                    "password": password
                }
                api_response = requests.post(f"{API_BASE_URL}/auth/register-phone", json=register_data)
                api_response.raise_for_status()
                
                response_data = api_response.json()
                
                if redis_client:
                    redis_client.set(session_id, json.dumps({
                        'token': response_data.get('token'),
                        'user_id': response_data.get('user', {}).get('id'),
                        'user_name': full_name
                    }), ex=3600)

                response = f"END Murakoze {full_name}, mwandikishijwe neza!"
            except requests.exceptions.HTTPError:
                response = "END Kwiyandikisha byanze. Ongera ugerageze."
            except Exception:
                response = "END Kwiyandikisha byanze: Ikosa ritazwi. Ongera ugerageze."
                
    elif user_response[0] == "2":  # Login flow
        if len(user_response) == 1:
            response = "CON Andika ijambo ry'ibanga:"
        elif len(user_response) == 2:
            password = user_response[1]
            
            try:
                login_data = {
                    "phone": formatted_phone,
                    "password": password
                }
                api_response = requests.post(f"{API_BASE_URL}/auth/login-phone", json=login_data)
                api_response.raise_for_status()

                response_data = api_response.json()
                user_full_name = response_data['user']['full_name']
                
                if redis_client:
                    redis_client.set(session_id, json.dumps({
                        'token': response_data.get('token'),
                        'user_id': response_data.get('user', {}).get('id'),
                        'user_name': user_full_name
                    }), ex=3600)

                # Show logged-in menu
                response = f"CON Murakaza neza {user_full_name}!\n"
                response += "1. Gusaba rendez-vous\n"
                response += "2. Amateka y'ubuvuzi\n"
                response += "3. Amateka y'ubwishyu\n"
                response += "4. Gusohoka"
                
            except requests.exceptions.HTTPError:
                response = "END Kwinjira byanze. Ongera ugerageze."
            except Exception:
                response = "END Kwinjira byanze: Ikosa ritazwi. Ongera ugerageze."
        
        # Handle logged-in menu options
        elif len(user_response) == 3:
            if not user_token or not user_id:
                response = "END Ikosa: Ntabwo winjiye. Ongera ugerageze."
                return response, 200, {'Content-Type': 'text/plain'}
                
            menu_choice = user_response[2]
            
            if menu_choice == "1":  # Book consultation
                response = "CON Andika ikibazo ufite mu magambo make:"
            elif menu_choice == "2":  # Consultation history
                try:
                    headers = {"Authorization": f"Bearer {user_token}"}
                    api_response = requests.get(f"{API_BASE_URL}/consultations/patient/{user_id}", headers=headers)
                    api_response.raise_for_status()
                    
                    consultations = api_response.json()
                    if consultations:
                        response = "END Amateka y'ubuvuzi:\n"
                        for i, consultation in enumerate(consultations[-3:], 1):
                            date = consultation.get('consultation_date', 'N/A')
                            status = consultation.get('status', 'N/A')
                            response += f"{i}. {date} - {status}\n"
                    else:
                        response = "END Ntamakuru y'ubuvuzi."
                except:
                    response = "END Ikosa mu gushaka amateka. Ongera ugerageze."
                    
            elif menu_choice == "3":  # Payment history
                try:
                    headers = {"Authorization": f"Bearer {user_token}"}
                    api_response = requests.get(f"{API_BASE_URL}/payments/patient/{user_id}", headers=headers)
                    api_response.raise_for_status()
                    
                    payments = api_response.json()
                    if payments:
                        response = "END Amateka y'ubwishyu:\n"
                        for i, payment in enumerate(payments[-3:], 1):
                            date = payment.get('payment_date', 'N/A')
                            amount = payment.get('amount', 'N/A')
                            response += f"{i}. {date} - {amount} RWF\n"
                    else:
                        response = "END Ntamakuru y'ubwishyu."
                except:
                    response = "END Ikosa mu gushaka amateka. Ongera ugerageze."
                    
            elif menu_choice == "4":  # Logout
                if redis_client:
                    redis_client.delete(session_id)
                response = "END Murabeho! Mwasohowe neza."
            else:
                response = "END Icyo wahisemo ntigishoboye kumenyekana."
        
        # Handle consultation booking after logged-in menu
        elif len(user_response) == 4 and user_response[2] == "1":
            consultation_description = user_response[3]
            
            if not user_token or not user_id:
                response = "END Ikosa: Ntabwo winjiye. Ongera ugerageze."
                return response, 200, {'Content-Type': 'text/plain'}

            try:
                # Create consultation
                consultation_data = {
                    "patient_id": user_id,
                    "notes": consultation_description,
                    "status": "pending",
                    "doctor_id": 1,
                    "consultation_date": datetime.now().strftime('%Y-%m-%d'),
                    "diagnosis": "",
                    "prescription": ""
                }
                headers = {"Authorization": f"Bearer {user_token}"}
                consultation_response = requests.post(f"{API_BASE_URL}/consultations", json=consultation_data, headers=headers)
                consultation_response.raise_for_status()
                
                consultation_result = consultation_response.json()
                consultation_id = consultation_result.get('id')

                # Auto-create payment for the consultation
                payment_amount = 5000  # Default consultation fee
                payment_data = {
                    "patient_id": user_id,
                    "consultation_id": consultation_id,
                    "amount": payment_amount,
                    "payment_date": datetime.now().strftime('%Y-%m-%d'),
                    "payment_method": "USSD",
                    "receipt_number": f"USSD-{user_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
                }
                
                payment_response = requests.post(f"{API_BASE_URL}/payments", json=payment_data, headers=headers)
                payment_response.raise_for_status()

                response = f"END Murakoze! Ikibazo cyanyu cyoherejwe.\nIgiciro: {payment_amount} RWF\nTuzakumenyesha muganga uhuye nacyo."
                
            except requests.exceptions.RequestException:
                response = "END Gusaba rendez-vous byanze. Ongera ugerageze."
    else:
        response = "END Icyo wahisemo ntigishoboye kumenyekana."

    return response, 200, {'Content-Type': 'text/plain'}