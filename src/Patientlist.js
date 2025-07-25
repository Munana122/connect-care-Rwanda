import React, { useEffect, useState } from "react";
import { database } from "./firebase-config";
import { ref, onValue } from "firebase/database";

function PatientList() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const patientRef = ref(database, "patients");
    onValue(patientRef, (snapshot) => {
      const data = snapshot.val();
      const list = [];
      for (let key in data) {
        list.push({ id: key, ...data[key] });
      }
      setPatients(list);
    });
  }, []);

  return (
    <div>
      <h2>All Patients</h2>
      <ul>
        {patients.map((patient) => (
          <li key={patient.id}>
            {patient.full_name} - {patient.contact_info}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PatientList;

