import jwt from 'jsonwebtoken';

class TokenService {

  async getAPIToken(apikey: any) {
    throw new Error('Method not implemented.');
  }

  async createRefreshAndAccessToken(payload: object) {
    try {
      // Create tokens
      const accessToken = jwt.sign({ payload }, process.env.APP_ACCESS_SECRET!, { expiresIn: '360000ms' });
      const refreshToken = jwt.sign({ payload }, process.env.APP_REFRESH_SECRET!, { expiresIn: '60d' });

      // Update authorization repository

      // Return access and refresh tokens
      return { accessToken, refreshToken };
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async verifyAccessToken(accessToken: string) {
    try {
      return jwt.verify(accessToken, process.env.APP_ACCESS_SECRET!);
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async verifyRefreshToken(refreshToken: string) {
    try {
      return jwt.verify(refreshToken, process.env.APP_REFRESH_SECRET!);
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }
}

export default TokenService;
