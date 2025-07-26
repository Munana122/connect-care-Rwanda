const pool = require('./db');

const paymentUtils = {
  // Get all payments
  getAllPayments: async () => {
    try {
      const [rows] = await pool.execute(`
        SELECT py.*, p.full_name as patient_name, c.consultation_date
        FROM Payments py
        JOIN patients p ON py.patient_id = p.id
        LEFT JOIN consultations c ON py.consultation_id = c.id
      `);
      return rows;
    } catch (error) {
      throw new Error(`Error getting payments: ${error.message}`);
    }
  },

  // Get payment by ID
  getPaymentById: async (id) => {
    try {
      const [rows] = await pool.execute(`
        SELECT py.*, p.full_name as patient_name, c.consultation_date
        FROM Payments py
        JOIN patients p ON py.patient_id = p.id
        LEFT JOIN consultations c ON py.consultation_id = c.id
        WHERE py.id = ?
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting payment: ${error.message}`);
    }
  },

  // Get payments by patient ID
  getPaymentsByPatientId: async (patientId) => {
    try {
      const [rows] = await pool.execute(`
        SELECT py.*, c.consultation_date
        FROM Payments py
        LEFT JOIN consultations c ON py.consultation_id = c.id
        WHERE py.patient_id = ?
      `, [patientId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting payments by patient ID: ${error.message}`);
    }
  },

  // Create payment
  createPayment: async (paymentData) => {
    try {
      const { patient_id, consultation_id, payment_date, amount, payment_method, receipt_number } = paymentData;
      const [result] = await pool.execute(
        'INSERT INTO Payments (patient_id, consultation_id, payment_date, amount, payment_method, receipt_number) VALUES (?, ?, ?, ?, ?, ?)',
        [patient_id, consultation_id, payment_date, amount, payment_method, receipt_number]
      );
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating payment: ${error.message}`);
    }
  },

  // Update payment
  updatePayment: async (id, paymentData) => {
    try {
      const { patient_id, consultation_id, payment_date, amount, payment_method, receipt_number } = paymentData;
      const [result] = await pool.execute(
        'UPDATE Payments SET patient_id = ?, consultation_id = ?, payment_date = ?, amount = ?, payment_method = ?, receipt_number = ? WHERE id = ?',
        [patient_id, consultation_id, payment_date, amount, payment_method, receipt_number, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating payment: ${error.message}`);
    }
  },

  // Delete payment
  deletePayment: async (id) => {
    try {
      const [result] = await pool.execute('DELETE FROM Payments WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting payment: ${error.message}`);
    }
  }
};

module.exports = paymentUtils;

