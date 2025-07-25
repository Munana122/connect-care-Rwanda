import React, { useState, useEffect } from "react";
import { database } from "./firebase-config";
import { ref, push, onValue } from "firebase/database";

function MessageBox({ patientId }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const messageRef = ref(database, "messages");
    onValue(messageRef, (snapshot) => {
      const data = snapshot.val();
      const msgs = [];
      for (let key in data) {
        if (data[key].patient_id === patientId) {
          msgs.push(data[key]);
        }
      }
      setMessages(msgs);
    });
  }, [patientId]);

  const sendMessage = async () => {
    const newMessage = {
      patient_id: patientId,
      message: messageText,
      timestamp: new Date().toISOString()
    };
    await push(ref(database, "messages"), newMessage);
    setMessageText("");
  };

  return (
    <div>
      <h2>Messages</h2>
      <div style={{ border: "1px solid gray", padding: "10px", maxHeight: "200px", overflowY: "scroll" }}>

