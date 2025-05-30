export const API_ENDPOINTS = {
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
  },
  PROPOSALS: {
    GET_DATA: (callId: string, proposal: string) =>
      `/proposal-data/${callId}/${proposal}`,
    REGISTER: `/register-proposal`,
  },
  AUTH: {
    REGISTER_ADDRESS: `/register`,
  },
};
