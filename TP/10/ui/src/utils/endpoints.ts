export const API_ENDPOINTS = {
  HEALTH: {
    CHECK: `/check-health`, // Nuevo endpoint
  },
  CONTRACT: {
    ADDRESS: `/contract-address`,
    OWNER: `/contract-owner`,
    IS_AUTHORIZED: (address: string) => `/authorized/${address}`,
  },
  CALLS: {
    GET_ALL: `/calls`,
    GET_BY_ID: (callId: string) => `/calls/${callId}`,
    CLOSING_TIME: (callId: string) => `/closing-time/${callId}`,
    CREATE: `/create`,
    CREATORS:`/creators`,
  },
  PROPOSALS: {
    GET_DATA: (callId: string, proposal: string) =>
      `/proposal-data/${callId}/${proposal}`,
    REGISTER: `/register-proposal`,
  },
  USER: {
    REGISTER_ADDRESS: `/register`,
    PENDING_ADDRESS: `/pending`,
  },
};
