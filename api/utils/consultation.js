const pool = require('./db');

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
      const { patient_id, doctor_id, consultation_date, notes, diagnosis, prescription } = consultationData;
      const [result] = await pool.execute(
        'INSERT INTO consultations (patient_id, doctor_id, consultation_date, notes, diagnosis, prescription) VALUES (?, ?, ?, ?, ?, ?)',
        [patient_id, doctor_id, consultation_date, notes, diagnosis, prescription]
      );
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

