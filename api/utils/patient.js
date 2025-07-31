const pool = require('./db');

const patientUtils = {
  // Get all patients
  getAllPatients: async () => {
    try {
      const [rows] = await pool.execute('SELECT * FROM patients');
      return rows;
    } catch (error) {
      throw new Error(`Error getting patients: ${error.message}`);
    }
  },

  // Get patient by ID
  getPatientById: async (id) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM patients WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting patient: ${error.message}`);
    }
  },

  // Create patient
  createPatient: async (patientData) => {
    try {
      const { full_name, date_of_birth, gender, contact_info, address, email, phone, password } = patientData;
      const [result] = await pool.execute(
        'INSERT INTO patients (full_name, date_of_birth, gender, contact_info, address, email, phone, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [full_name, date_of_birth, gender, contact_info, address, email, phone, password]
      );
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating patient: ${error.message}`);
    }
  },

  // Update patient
  updatePatient: async (id, patientData) => {
    try {
      const fields = Object.keys(patientData);
      const values = Object.values(patientData);
      
      if (fields.length === 0) {
        return true; // No fields to update
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const sql = `UPDATE patients SET ${setClause} WHERE id = ?`;
      values.push(id);

      const [result] = await pool.execute(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating patient: ${error.message}`);
    }
  },

  // Delete patient
  deletePatient: async (id) => {
    try {
      const [result] = await pool.execute('DELETE FROM patients WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting patient: ${error.message}`);
    }
  }
};

module.exports = patientUtils;