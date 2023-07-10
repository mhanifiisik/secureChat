import type { AxiosError } from 'axios';

import UserAuthenticationDetails from '../components/auth/models/sign-in.model';
import UserRegistrationDetails from '../components/auth/models/sign-up.model';
import apiClient from './api';

export const authApi = {
  registerUser: async (registrationDetails: UserRegistrationDetails) => {
    try {
      const response = await apiClient.post('/auth/sign-up', registrationDetails);
      return { success: true, data: response.data };
    } catch (error) {
      const err = error as AxiosError;
      return { success: false, message: err.message };
    }
  },

  authenticateUser: async (authenticationDetails: UserAuthenticationDetails) => {
    try {
      const response = await apiClient.post('/auth/sign-in', authenticationDetails);
      return { success: true, data: response.data };
    } catch (error) {
      const err = error as AxiosError;
      return { success: false, message: err.message };
    }
  },
};
