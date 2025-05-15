export const setTokens = (authResult) => {
    localStorage.setItem('accessToken', authResult.accessToken);
    localStorage.setItem('refreshToken', authResult.refreshToken);
    
    if (authResult.user) {
      localStorage.setItem('user', JSON.stringify(authResult.user));
    }
  };
  
  export const getAccessToken = () => 
    localStorage.getItem('accessToken');
  
  export const getRefreshToken = () => 
    localStorage.getItem('refreshToken');
  
  export const removeTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };
  
  export const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  };
  
  export const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded) return true;
    
    return decoded.exp * 1000 < Date.now();
  };
  
  export const getStoredUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };