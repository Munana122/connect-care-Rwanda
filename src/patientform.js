import React, { useState } from "react";
import { database } from "./firebase-config";
import { ref, push } from "firebase/database";

function PatientForm() {
  const [patient, setPatient] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    contact_info: "",
    address: ""
  });

  const handleChange = (e) => {
    setPatient({ ...patient, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const patientRef = ref(database, "patients");
      await push(patientRef, patient);
      alert("Patient added!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Add Patient</h2>
      <input name="full_name" placeholder="Full Name" onChange={handleChange} />
      <input name="date_of_birth" type="date" onChange={handleChange} />
      <input name="gender" placeholder="Gender" onChange={handleChange} />
      <input name="contact_info" placeholder="Phone" onChange={handleChange} />
      <input name="address" placeholder="Address" onChange={handleChange} />
      <br />

