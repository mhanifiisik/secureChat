import type { AxiosError } from 'axios';

import apiClient from './api';
import type UserAuthenticationDetails from './models/sign-in.model';
import type UserRegistrationDetails from './models/sign-up.model';

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
