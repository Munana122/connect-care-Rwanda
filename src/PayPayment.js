import React, { useState } from "react";
import axios from "axios";

function KPayPayment() {
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("");

  const initiatePayment = async () => {
    const payload = {
      phone: phoneNumber,
      amount: amount,
      currency: "RWF",
      description: "Consultation Payment"
    };

    try {
      const response = await axios.post(
        "https://pay.esicia.com/initiate-payment",
        payload,
        {
          headers: {
            "Kpay-Key": "YOUR_API_KEY",
            Authorization: "Basic YOUR_BASE64_ENCODED_CREDENTIALS",
            "Content-Type": "application/json"
          }
        }
      );
      setStatus(`Payment initiated: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setStatus(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div>
      <h2>Pay for Services</h2>
      <input placeholder="Phone Number" onChange={(e) => setPhoneNumber(e.target.value)} />
      <input placeholder="Amount" onChange={(e) => setAmount(e.target.value)} />
      <button onClick={initiatePayment}>Pay</button>
      <p>{status}</p>
    </div>
  );
}

export default KPayPayment;

