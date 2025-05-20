const isProduction = false;

const API_GATEWAY = isProduction ? "http://service-proxy:8079" : "http://localhost:8079";
const SERVICE_USER = isProduction ? `${API_GATEWAY}/SERVICE-USERS/api` : "http://localhost:8085/api";
const SERVICE_HARMONI = isProduction ? `${API_GATEWAY}/SERVICE-HARMONI/api` : "http://localhost:8200";
const PLAN_CLASSEMENT = isProduction ? `${API_GATEWAY}/SERVICE-PLANCLASSMENT/plan-classements` : "http://localhost:8101";
const DOMAINE_VALEURS = isProduction ? `${API_GATEWAY}/DOMAINEVALEURS/domaines_valeurs` : "http://localhost:8102";
const DOMAINE_VALEURS_ELEMENTS = isProduction ? `${API_GATEWAY}/DOMAINEVALEURS/elements_valeurs` : "http://localhost:8102";
const SERVICE_METADONNEE = isProduction ? `${API_GATEWAY}/SERVICE-METADONNEE` : "http://localhost:8103";

export const API_URL = {
    isProduction,
    API_GATEWAY,
    // For User
    SERVICE_USER,
    LOGGIN_USER: `${SERVICE_USER}/kairos-user-service-login`,
    REFRESH_TOKEN_USER: `${SERVICE_USER}/kairos-user-service-refresh-token`,
    REGISTER_USER: `${SERVICE_USER}/register-user`,
    UPDATE_USER: `${SERVICE_USER}/update-user`,
    DELETE_USER: `${SERVICE_USER}/delete-user`,
    GET_USER: `${SERVICE_USER}/get-user`,
    GET_USERS: `${SERVICE_USER}/get-users`,
    // For Harmoni
    SERVICE_HARMONI,
    // For Plan Classement
    PLAN_CLASSEMENT,
    // For Domaine Valeurs
    DOMAINE_VALEURS,
    DOMAINE_VALEURS_ELEMENTS,
    // For Metadonnees
    SERVICE_METADONNEE,
};

export default API_URL;