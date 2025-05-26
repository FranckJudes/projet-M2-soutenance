const isProduction = false;
const BASE_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;
const API_GATEWAY = import.meta.env.VITE_BASE_URL_API;


const SERVICE_HARMONI = isProduction ? `${API_GATEWAY}/SERVICE-HARMONI/api` : BASE_URL + "/api";
const BPMN = isProduction ? `${API_GATEWAY}/BPMN/api` : BASE_URL;

export const API_URL = {
    isProduction,
    // For Harmoni Auth
    SERVICE_HARMONI,
    AUTH_LOGIN: `${SERVICE_HARMONI}/auth/login`,
    AUTH_REGISTER: `${SERVICE_HARMONI}/auth/register`,
    AUTH_REFRESH_TOKEN: `${SERVICE_HARMONI}/auth/refresh-token`,
    AUTH_LOGOUT: `${SERVICE_HARMONI}/auth/logout`,
    // For BPMN
    BPMN,
};

export default API_URL;