import api from './api';

// Patient API calls
export const patientAPI = {
  getAllPatients: async () => {
    try {
      const response = await api.get('/patients');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch patients' };
    }
  },

  getPatientById: async (id) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch patient' };
    }
  },

  createPatient: async (patientData) => {
    try {
      const response = await api.post('/patients', patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create patient' };
    }
  },

  updatePatient: async (id, patientData) => {
    try {
      const response = await api.put(`/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update patient' };
    }
  },

  deletePatient: async (id) => {
    try {
      const response = await api.delete(`/patients/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete patient' };
    }
  }
};

export default patientAPI;