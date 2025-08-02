import api from './api';

// Payment API calls
export const paymentAPI = {
  getAllPayments: async () => {
    try {
      const response = await api.get('/payments');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch payments' };
    }
  },

  getPaymentById: async (id) => {
    try {
      const response = await api.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch payment' };
    }
  },

  getPaymentsByPatientId: async (patientId) => {
    try {
      const response = await api.get(`/payments/patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch payments' };
    }
  },

  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create payment' };
    }
  },

  updatePayment: async (id, paymentData) => {
    try {
      const response = await api.put(`/payments/${id}`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update payment' };
    }
  },

  deletePayment: async (id) => {
    try {
      const response = await api.delete(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete payment' };
    }
  }
};

export default paymentAPI;