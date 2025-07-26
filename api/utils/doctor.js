const pool = require('./db');

const doctorUtils = {
  // Get all doctors
  getAllDoctors: async () => {
    try {
      const [rows] = await pool.execute('SELECT * FROM doctors');
      return rows;
    } catch (error) {
      throw new Error(`Error getting doctors: ${error.message}`);
    }
  },

  // Get doctor by ID
  getDoctorById: async (id) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM doctors WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting doctor: ${error.message}`);
    }
  },

  // Create doctor
  createDoctor: async (doctorData) => {
    try {
      const { full_name, specialty, license_number, contact_info } = doctorData;
      const [result] = await pool.execute(
        'INSERT INTO doctors (full_name, specialty, license_number, contact_info) VALUES (?, ?, ?, ?)',
        [full_name, specialty, license_number, contact_info]
      );
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating doctor: ${error.message}`);
    }
  },

  // Update doctor
  updateDoctor: async (id, doctorData) => {
    try {
      const { full_name, specialty, license_number, contact_info } = doctorData;
      const [result] = await pool.execute(
        'UPDATE doctors SET full_name = ?, specialty = ?, license_number = ?, contact_info = ? WHERE id = ?',
        [full_name, specialty, license_number, contact_info, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating doctor: ${error.message}`);
    }
  },

  // Delete doctor
  deleteDoctor: async (id) => {
    try {
      const [result] = await pool.execute('DELETE FROM doctors WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting doctor: ${error.message}`);
    }
  }
};

module.exports = doctorUtils;

