import axios from "axios";
import { API_ENDPOINTS } from "../utils/endpoints";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error("API error:", error.response?.data);
    return Promise.reject(error);
  }
);

export const ContractService = {
  getAddress: () => apiClient.get(API_ENDPOINTS.CONTRACT.ADDRESS),
  getOwner: () => apiClient.get(API_ENDPOINTS.CONTRACT.OWNER),
  isAuthorized: (address: string) =>
    apiClient.get(API_ENDPOINTS.CONTRACT.IS_AUTHORIZED(address)),
};

export const CallsService = {
  getAll: () => apiClient.get(API_ENDPOINTS.CALLS.GET_ALL),
  getById: (callId: string) =>
    apiClient.get(API_ENDPOINTS.CALLS.GET_BY_ID(callId)),
  getClosingTime: (callId: string) =>
    apiClient.get(API_ENDPOINTS.CALLS.CLOSING_TIME(callId)),
  create: (callId: string, closingTime: string, signature: string) =>
    apiClient.post(API_ENDPOINTS.CALLS.CREATE, {
      callId,
      closingTime,
      signature,
    }),
  getCreators: () => apiClient.get(API_ENDPOINTS.CALLS.CREATORS),
};

export const ProposalService = {
  getData: (callId: string, proposal: string) =>
    apiClient.get(API_ENDPOINTS.PROPOSALS.GET_DATA(callId, proposal)),
  register: (callId: string, proposal: string) =>
    apiClient.post(API_ENDPOINTS.PROPOSALS.REGISTER, { callId, proposal }),
};

export const UserService = {
  registerAddress: (address: string, signature: string) =>
    apiClient.post(API_ENDPOINTS.USER.REGISTER_ADDRESS, { address, signature }),
  getPendingAddress: () => apiClient.get(API_ENDPOINTS.USER.PENDING_ADDRESS),
};

export const api = {
  checkHealth: () => apiClient.get(API_ENDPOINTS.HEALTH.CHECK),
};
