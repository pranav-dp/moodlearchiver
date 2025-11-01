import { MoodleClient } from './MoodleAPI';

export class AuthService {
  static TOKEN_KEY = 'moodle_auth_token';
  static USER_DATA_KEY = 'moodle_user_data';
  static EXPIRY_KEY = 'moodle_token_expiry';
  
  // Token expires after 3 months (90 days)
  static TOKEN_EXPIRY_DAYS = 90;

  static saveAuthData(username, backend, token, userid) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.TOKEN_EXPIRY_DAYS);
    
    const authData = {
      username,
      backend,
      token,
      userid,
      timestamp: Date.now()
    };

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(authData));
    localStorage.setItem(this.EXPIRY_KEY, expiryDate.getTime().toString());
  }

  static getAuthData() {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userData = localStorage.getItem(this.USER_DATA_KEY);
      const expiry = localStorage.getItem(this.EXPIRY_KEY);

      if (!token || !userData || !expiry) {
        return null;
      }

      // Check if token has expired
      const expiryDate = new Date(parseInt(expiry));
      if (new Date() > expiryDate) {
        this.clearAuthData();
        return null;
      }

      return JSON.parse(userData);
    } catch (error) {
      console.error('Error retrieving auth data:', error);
      this.clearAuthData();
      return null;
    }
  }

  static clearAuthData() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
  }

  static isAuthenticated() {
    const authData = this.getAuthData();
    return authData !== null;
  }

  static async createMoodleClientFromStorage() {
    const authData = this.getAuthData();
    if (!authData) {
      return null;
    }

    try {
      const client = new MoodleClient(authData.username, authData.backend);
      client.token = authData.token;
      client.userid = authData.userid;
      
      // Verify the token is still valid by making a test API call
      await client.getUserID();
      
      return client;
    } catch (error) {
      console.error('Stored token is invalid:', error);
      this.clearAuthData();
      return null;
    }
  }

  static async login(username, password, backend) {
    try {
      const client = new MoodleClient(username, backend);
      await client.getToken(password);
      const userid = await client.getUserID();
      
      // Save authentication data
      this.saveAuthData(username, backend, client.token, userid);
      
      return client;
    } catch (error) {
      throw error;
    }
  }

  static logout() {
    this.clearAuthData();
  }

  static getTokenExpiryDate() {
    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    if (expiry) {
      return new Date(parseInt(expiry));
    }
    return null;
  }

  static getRemainingDays() {
    const expiryDate = this.getTokenExpiryDate();
    if (expiryDate) {
      const now = new Date();
      const diffTime = expiryDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
    return 0;
  }

  static async refreshToken(currentClient) {
    const authData = this.getAuthData();
    if (!authData) {
      throw new Error('No authentication data found');
    }

    try {
      // Create a new client and get a fresh token
      const newClient = new MoodleClient(authData.username, authData.backend);
      // Note: We can't refresh without password, so we'll extend the current token's expiry
      // In a real JWT implementation, you'd have a refresh token endpoint
      
      // For now, just extend the current token's expiry
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.TOKEN_EXPIRY_DAYS);
      localStorage.setItem(this.EXPIRY_KEY, expiryDate.getTime().toString());
      
      return currentClient;
    } catch (error) {
      this.clearAuthData();
      throw error;
    }
  }
}
