import api from './api';

// Consultation API calls
export const consultationAPI = {
  getAllConsultations: async () => {
    try {
      const response = await api.get('/consultations');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch consultations' };
    }
  },

  getConsultationById: async (id) => {
    try {
      const response = await api.get(`/consultations/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch consultation' };
    }
  },

  getConsultationsByPatientId: async (patientId) => {
    try {
      const response = await api.get(`/consultations/patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch consultations' };
    }
  },

  getConsultationsByDoctorId: async (doctorId) => {
    try {
      const response = await api.get(`/consultations/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch consultations' };
    }
  },

  createConsultation: async (consultationData) => {
    try {
      const response = await api.post('/consultations', consultationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create consultation' };
    }
  },

  updateConsultation: async (id, consultationData) => {
    try {
      const response = await api.put(`/consultations/${id}`, consultationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update consultation' };
    }
  },

  deleteConsultation: async (id) => {
    try {
      const response = await api.delete(`/consultations/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete consultation' };
    }
  }
};

export default consultationAPI;