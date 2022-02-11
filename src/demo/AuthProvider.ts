
import axios  from 'axios';

export class AuthProvider {

  constructor() {
  }

  async getAuthenticationToken(username: string, password: string): Promise<{token?: string, error?: string}> {
    try {

      const credentials = `${username}:${password}`;
      const buffer = new Buffer(credentials);
      const authorizationData = buffer.toString('base64');
      const { data } = await axios.post('/relay/api/auth', {}, {
        headers: {
          'Authorization': `Basic ${authorizationData}`
        }
      });

      return {
        token: data.token
      };

    } catch (error) {
      return {
        error: error.message
      }
    }
  }

}
