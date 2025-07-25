from flask import Flask, request
import africastalking

app = Flask(__name__)

@app.route('/ussd', methods=['POST'])
def ussd_callback():
    session_id = request.form.get('sessionId')
    service_code = request.form.get('serviceCode')
    phone_number = request.form.get('phoneNumber')
    text = request.form.get('text')

    # jus to split the text ere
    user_response = text.strip().split('*')

    response = ""

    if text == "":
        response = "CON Murakaza neza kuri ConnectCare\n"
        response += "1. Gusaba rendez-vous\n"
        response += "2. Guhamagara muganga\n"
        response += "3. Inama z'ubuzima"
    elif user_response[0] == "1":
        if len(user_response) == 1:
            response = "CON Andika amazina yawe:"
        elif len(user_response) == 2:
            response = "CON Hitamo italiki yo kujya kwa muganga (urugero: 22/07/2025):"
        elif len(user_response) == 3:
            response = "END Murakoze! Tuzakumenyesha igihe cya rendez-vous."
    elif user_response[0] == "2":
        response = "END Hamagara muganga kuri: +250 792041765"
    elif user_response[0] == "3":
        response = "END Fata amazi menshi, ruhuka neza kandi irinde stress!"
    else:
        response = "END Icyo wahisemo ntigishoboye kumenyekana."

    return response, 200, {'Content-Type': 'text/plain'}

if __name__ == '__main__':
    app.run(port=5000, debug=True)
