import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;


export const getCalls = () => axios.get(`${API_BASE}/calls`);

export const registerProposal = (callId, proposal) =>
  axios.post(`${API_BASE}/register-proposal`, { callId, proposal });

export const verifyProposal = (callId, proposal) =>
  axios.get(`${API_BASE}/proposal-data/${callId}/${proposal}`);
