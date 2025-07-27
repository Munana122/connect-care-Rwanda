# 🩺 ConnectCare — Telemedicine & USSD App

ConnectCare is a mobile health solution that helps users in Rwanda easily access medical consultations, book appointments, and track health history — even without internet via USSD!

## 📱 Mobile App (React Native)

The app includes:
- 🏠 Dashboard (Murakaza neza!)
- 🔍 Doctor search
- 📅 Book appointments using calendar
- 💬 Mental health chatbot (AI to be added)
- 📝 Symptom checker (Urwaye iki?)
- 📞 Call a doctor directly
- 🔐 Login & Signup with email or phone number

> All pages use Kinyarwanda-friendly language and soft pink & light blue themes.

## ✳️ USSD App (Python + Flask)

Even without a smartphone, users can:
- Kwiyandikisha (Register)
- Kwinjira (Login)
- Gusaba rendez-vous
- Reba amateka y’ubuvuzi
- Reba ubwishyu
- Gusohoka (Logout)

Built with:
- Flask
- Redis (for sessions)
- Python-dotenv
- Hosted via **Vercel**

### Example USSD Flow
Dial the USSD code and select:
Kwiyandikisha

Kwinjira

After login:
Gusaba rendez-vous

Amateka y’ubuvuzi

Amateka y'ubwishyu

Gusohoka

## 🚀 Deployment (USSD)
1. Backend built with `Flask`
2. Deploy to Vercel using `vercel.json`
3. Integrate with Africa's Talking dashboard

### 🗂️ Required Files
- `app.py` (USSD logic)
- `.env` (credentials & API URL)
- `vercel.json` (deployment config)
- `requirements.txt`

## 📦 requirements.txt
flask
africastalking
requests
redis
python-dotenv


## 🛠 Future Plans
- Real-time chat with doctors
- E-prescriptions
- USSD payment via MTN Mobile Money
- Admin dashboard for clinics

---

Created with ❤️ by Kayumba David Pontient
