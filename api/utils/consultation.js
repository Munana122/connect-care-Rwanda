const pool = require('./db');
const { sendSms } = require('./twilio');
const { sendEmail } = require('./email');

const consultationUtils = {
  // Get all consultations
  getAllConsultations: async () => {
    try {
      const [rows] = await pool.execute(`
        SELECT c.*, p.full_name as patient_name, d.full_name as doctor_name 
        FROM consultations c
        JOIN patients p ON c.patient_id = p.id
        JOIN doctors d ON c.doctor_id = d.id
      `);
      return rows;
    } catch (error) {
      throw new Error(`Error getting consultations: ${error.message}`);
    }
  },

  // Get consultation by ID
  getConsultationById: async (id) => {
    try {
      const [rows] = await pool.execute(`
        SELECT c.*, p.full_name as patient_name, d.full_name as doctor_name 
        FROM consultations c
        JOIN patients p ON c.patient_id = p.id
        JOIN doctors d ON c.doctor_id = d.id
        WHERE c.id = ?
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting consultation: ${error.message}`);
    }
  },

  // Get consultations by patient ID
  getConsultationsByPatientId: async (patientId) => {
    try {
      const [rows] = await pool.execute(`
        SELECT c.*, d.full_name as doctor_name 
        FROM consultations c
        JOIN doctors d ON c.doctor_id = d.id
        WHERE c.patient_id = ?
      `, [patientId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting consultations by patient ID: ${error.message}`);
    }
  },

  // Get consultations by doctor ID
  getConsultationsByDoctorId: async (doctorId) => {
    try {
      const [rows] = await pool.execute(`
        SELECT c.*, p.full_name as patient_name 
        FROM consultations c
        JOIN patients p ON c.patient_id = p.id
        WHERE c.doctor_id = ?
      `, [doctorId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting consultations by doctor ID: ${error.message}`);
    }
  },

  // Create consultation
  createConsultation: async (consultationData) => {
    try {
      const { patient_id, doctor_id, consultation_date, notes, diagnosis, prescription, status } = consultationData;
      const [result] = await pool.execute(
        'INSERT INTO consultations (patient_id, doctor_id, consultation_date, notes, diagnosis, prescription, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [patient_id, doctor_id, consultation_date, notes || null, diagnosis || null, prescription || null, status || 'scheduled']
      );

      // Send notification
      try {
        const [[user]] = await pool.execute('SELECT full_name, phone, email FROM users WHERE id = ?', [patient_id]);
        const [[doctor]] = await pool.execute('SELECT full_name FROM doctors WHERE id = ?', [doctor_id]);

        if (user) {
          const patientName = user.full_name;
          const doctorName = doctor.full_name;

          const smsMessage = `Hi ${patientName}. Your appointment with Dr. ${doctorName} on ${consultation_date} is confirmed. Connect Care Team.`;
          
          const emailHtml = `
            <div style="font-family: sans-serif; text-align: center;">
              <img src="cid:logo" alt="Connect Care Logo" style="width: 150px; margin-bottom: 20px;"/>
              <h2>Appointment Confirmation</h2>
              <p>Hi ${patientName},</p>
              <p>Your appointment with <strong>Dr. ${doctorName}</strong> on <strong>${consultation_date}</strong> has been booked successfully.</p>
              <p>Please contact us if you require any assistance.</p>
              <br/>
              <p>Thank you,</p>
              <p><strong>The Connect Care Team</strong></p>
            </div>
          `;

          if (user.phone) {
            await sendSms(user.phone, smsMessage);
          } else if (user.email) {
            await sendEmail(user.email, 'Your Appointment is Confirmed', smsMessage, emailHtml);
          }
        }
      } catch (notificationError) {
        console.error(`Failed to send notification: ${notificationError.message}`);
      }

      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating consultation: ${error.message}`);
    }
  },

  // Update consultation
  updateConsultation: async (id, consultationData) => {
    try {
      const { patient_id, doctor_id, consultation_date, notes, diagnosis, prescription } = consultationData;
      const [result] = await pool.execute(
        'UPDATE consultations SET patient_id = ?, doctor_id = ?, consultation_date = ?, notes = ?, diagnosis = ?, prescription = ? WHERE id = ?',
        [patient_id, doctor_id, consultation_date, notes, diagnosis, prescription, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating consultation: ${error.message}`);
    }
  },

  // Delete consultation
  deleteConsultation: async (id) => {
    try {
      const [result] = await pool.execute('DELETE FROM consultations WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting consultation: ${error.message}`);
    }
  }
};

module.exports = consultationUtils;