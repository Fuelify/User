import jwt from 'jsonwebtoken';

import ConfigurationService from './configuration-service';
import LoggingService from './logging-service';
import AuthRepository from '../repositories/auth-repository';
import ResponseModel from '../models/response-model';
import UserModel from '../models/user-model';
import UserRepository from '../repositories/user-repository';

enum TokenScope {
  ADMIN,
  BASIC,
  TEST
}

// Define a local cache variable for storing revoked tokens
var revokedTokens = new Set<string>();

interface Dependencies {
  configurationService: ConfigurationService;
  loggingService: LoggingService
  authRepository: AuthRepository
  userRepository: UserRepository
}

class TokenService {
  tokenRepository: { description: string; scope: any; token: string; }[];
  configurationService: ConfigurationService;
  loggingService: LoggingService;
  authRepository: AuthRepository;
  userRepository: UserRepository;

  constructor({ configurationService, loggingService, authRepository, userRepository }: Dependencies) {
    this.configurationService = configurationService;
    this.loggingService = loggingService;
    this.authRepository = authRepository;
    this.userRepository = userRepository;

    this.tokenRepository = [
      {
        description: 'API Authentication Token for basic access',
        scope: TokenScope.BASIC,
        token: this.configurationService.FUELIFY_API_TOKEN
      },
      {
        description: 'Admin Authentication Token for admin level access',
        scope: TokenScope.ADMIN,
        token: this.configurationService.FUELIFY_ADMIN_TOKEN
      },
      {
        description: 'API Authentication Token for test access',
        scope: TokenScope.TEST,
        token: configurationService.FUELIFY_API_TOKEN_TEST
      }
    ];

  }



  // Method to check if a sessionToken is revoked or blacklisted
  isTokenRevoked(accessToken: string): boolean {
    return revokedTokens.has(accessToken);
  }

  async getAPIToken(token: string) {
    try {      
      return this.tokenRepository.find(element => element.token === token);      
    } catch (err) {
      this.loggingService.error('Error getting api token.', err);
    }
  }
  
  async createRefreshTokenAndAccessToken(tokenContent: { userId: string, deviceId: string, family: string }) {
    try{

      // Create payload for token
      const payload = {
        id: tokenContent.userId,
        deviceId: tokenContent.deviceId,
        role: tokenContent.family,
        iat: Math.floor(Date.now() / 1000), // Issued at (timestamp in seconds)
        //exp: Math.floor(Date.now() / 1000) + parseInt(this.configurationService.FUELIFY_APP_ACCESSTOKEN_TIMEOUT.replace('h','')), //TODO make this more dynamic
        iss: 'fuelify-api',
        //scopes: ['read', 'write'],
      };

      const accessToken = jwt.sign({payload}, this.configurationService.FUELIFY_APP_ACCESS_SECRET, { expiresIn: this.configurationService.FUELIFY_APP_ACCESSTOKEN_TIMEOUT});
      const refreshToken = jwt.sign({payload}, this.configurationService.FUELIFY_APP_REFRESH_SECRET, { expiresIn: this.configurationService.FUELIFY_APP_REFRESHTOKEN_TIMEOUT});
      
      const decodedAccessToken = jwt.decode(accessToken);
      const decodedRefreshToken = jwt.decode(refreshToken);

      if (typeof decodedRefreshToken === 'object' && decodedRefreshToken !== null &&
          typeof decodedAccessToken === 'object' && decodedAccessToken !== null) {

        interface AuthModel {
          id: string;
          family: string;
          refreshToken: string;
          refreshTokenExpiration: number | undefined;
        }

        const auth: AuthModel = {
          id: tokenContent.userId,
          family: tokenContent.family,
          refreshToken: refreshToken,
          refreshTokenExpiration: decodedRefreshToken.exp
        };

        // Update refresh token in database
        this.authRepository.saveRefreshToken(auth);
        
        return { 
          accessToken: accessToken, 
          refreshToken: refreshToken, 
          accessTokenExpiration: decodedAccessToken.exp, 
          refreshTTokenExpiration: decodedRefreshToken.exp, 
          family: auth.family 
        };

      } else {
        this.loggingService.warn('Unable to decode access and refersh token properly')
      }
    } catch (err) {
      this.loggingService.error('Error creating refresh token and access token.', err);
    }
  }
  
  async verifyAccessToken(accessToken: string) {
    try{
      if (this.isTokenRevoked(accessToken)) {
        this.loggingService.warn('Revoked token being used.', accessToken);
        throw new Error('Token revoked');
      } else {
        return jwt.verify(accessToken, this.configurationService.FUELIFY_APP_ACCESS_SECRET);
      }
    } catch (err) {
      this.loggingService.error('Error verifying access token.', err);
    }
  }
  
  async verifyRefreshToken(refreshToken: string) {
    try{
      const payload = jwt.verify(refreshToken, this.configurationService.FUELIFY_APP_REFRESH_SECRET)
      return payload
    } catch (err) {
      this.loggingService.error('Error verifying refresh token.', err);
    }
  }
  
  async createPasswordResetToken(user: UserModel) {
    try{

      // Create payload for token
      const payload = {
        id: user.id,
        role: user.family,
        iat: Math.floor(Date.now() / 1000), // Issued at (timestamp in seconds)
        iss: 'fuelify-api',
      };

      //  Create password reset token
      const passwordResetToken: string = jwt.sign({payload}, this.configurationService.FUELIFY_APP_ACCESS_SECRET, {expiresIn: '3600000ms'}); //60min
      
      interface PasswordResetModel {
        id: string;
        family: string;
        passwordResetToken: string;
      }

      const reset: PasswordResetModel = {
        id: user.id,
        family: user.family,
        passwordResetToken: passwordResetToken,
      }

      // Save password reset token in database
      const saveResponse = this.authRepository.savePasswordResetToken(reset);

      return saveResponse;
      
    } catch (err) {
      this.loggingService.error('Error creating password reset token.', err);
      return new ResponseModel(500, "error", "Error creating password reset token.");
    }
  }
  
  async verifyPasswordResetToken(passwordResetToken: string) {
    try {
      const payload = jwt.verify(passwordResetToken, this.configurationService.FUELIFY_APP_ACCESS_SECRET);

      // Fetch password reset token from database
      //@ts-ignore
      const getResponse = await this.userRepository.getUserById(payload.id, payload.role);

      if (getResponse instanceof UserModel) {
        if (getResponse.passwordResetToken === passwordResetToken) {
          return new ResponseModel(200, "success", "Password reset token matches!", getResponse);
        } else {
          return new ResponseModel(401, "error", "Password reset token does not match!");
        }
      } else {
        return getResponse
      }
    } catch (err) {
      this.loggingService.error('Error occurred while attempting to verify password reset token.', err);
      return new ResponseModel(500, "error", "Error occurred while attempting to verify password reset token.");
    }
  }

  async revokeToken(user: UserModel, accessToken: string) {
    try {
      this.loggingService.info(`Revoking token for user ${user.id}`);
      // Add the token to the revokedTokens set list in local cache
      revokedTokens.add(accessToken);
      // Schedule the removal of the sessionToken after it is due to expire
      this.scheduleAccessTokenRemoval(accessToken);
      // Delete refresh token from database
      const deleteResponse: ResponseModel = await this.authRepository.deleteRefreshToken(user);
      return deleteResponse;
    } catch (err) {
      this.loggingService.error('Error revoking access token.', err);
      throw Error('Error revoking access token.');
    }
  }

  async scheduleAccessTokenRemoval(accessToken: string) {
    // Decoding the access token to access the payload
    const decodedToken: any = jwt.verify(accessToken, this.configurationService.FUELIFY_APP_ACCESS_SECRET);
    // Accessing the expiresIn property
    const expiresIn = decodedToken.exp - Math.floor(Date.now() / 1000);
    // this should be able to be set in the token service
    setTimeout(() => { // asyncrounously schedule for the token to be removed from local cache after it expires
        revokedTokens.delete(accessToken);
    }, expiresIn);

  }


}

export default TokenService;
