import jwt from 'jsonwebtoken';

import ConfigurationService from './configuration-service';
import LoggingService from './logging-service';

enum TokenScope {
  ADMIN,
  BASIC,
  TEST
}

interface Dependencies {
  configurationService: ConfigurationService;
  loggingService: LoggingService;
}

class TokenService {
  tokenRepository: { description: string; scope: any; token: string; }[];
  configurationService: ConfigurationService;
  loggingService: LoggingService;

  constructor({ configurationService, loggingService }: Dependencies) {
    this.configurationService = configurationService;
    this.loggingService = loggingService;
    //this.authRepository = authRepository;
    //this.dateService = dateService;

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

  async getAPIToken(token: string) {
    try {      
      return this.tokenRepository.find(element => element.token === token);      
    } catch (err) {
      this.loggingService.error('Error getting api token.', err);
    }
  }
  
  async createRefreshTokenAndAccessToken(tokenContent: { id: string, level: string }) {
    try{

      // If logging in as ADMIn tag the family (ADMIN) to the end of the id in order to create separate ADMIN session from USER session
      const tokenId = tokenContent.level === 'ADMIN' ? `${tokenContent.id}${tokenContent.level}` : `${tokenContent.id}`
      const payload = {id: tokenId};

      const accessToken = jwt.sign({payload}, this.configurationService.FUELIFY_APP_ACCESS_SECRET, { expiresIn: this.configurationService.FUELIFY_APP_ACCESSTOKEN_TIMEOUT});
      const refreshToken = jwt.sign({payload}, this.configurationService.FUELIFY_APP_REFRESH_SECRET, { expiresIn: this.configurationService.FUELIFY_APP_REFRESHTOKEN_TIMEOUT});
      
      const decodedAccessToken = jwt.decode(accessToken);
      const decodedRefreshToken = jwt.decode(refreshToken);

      if (typeof decodedRefreshToken === 'object' && decodedRefreshToken !== null &&
          typeof decodedAccessToken === 'object' && decodedAccessToken !== null) {

        const auth = {
          id: tokenContent.id,
          level: tokenContent.level,
          refreshToken: refreshToken,
          refreshTokenExp: decodedRefreshToken.exp
        };

        // Update refresh token in database
        //this.authRepository.addRefreshToken(auth);
        
        return { accesstoken: accessToken, refreshtoken: refreshToken, refreshtokenExp: decodedRefreshToken.exp, accesstokenExp: decodedAccessToken.exp, family: auth.level };

      } else {
        this.loggingService.warn('Unable to decode access and refersh token properly')
      }
    } catch (err) {
      this.loggingService.error('Error creating refresh token and access token.', err);
    }
  }
  
  async verifyAccessToken(refreshToken: string) {
    try{
      return jwt.verify(refreshToken, this.configurationService.FUELIFY_APP_ACCESS_SECRET);
    } catch (err) {
      // TODO: Handle token expired
      this.loggingService.error('Error verifying access token.', err);
    }
  }
  
  async verifyRefreshToken(refreshToken: string) {
    try{
      const payload = jwt.verify(refreshToken, this.configurationService.FUELIFY_APP_REFRESH_SECRET)
      
      if (typeof payload === 'object' && payload != null) {
        const userid = payload.payload.id;
        /*const getTokenResult = await this.authRepository.getRefreshToken(userid);
        if(getTokenResult !== null && getTokenResult.refreshToken === refreshToken) {
          return payload;
        } else {
          this.loggingService.warn('RefreshToken already used or does not exist.');
        }*/
        return payload
      } else {
        this.loggingService.warn('Unable to parse refresh token');
      }
    } catch (err) {
      this.loggingService.error('Error verifying refresh token.', err);
    }
  }
  
  async createPasswordResetToken(user: { id: any; email: any; }) {
    try{
      const passwordResetToken = jwt.sign({user}, this.configurationService.FUELIFY_APP_ACCESS_SECRET, {expiresIn: '3600000ms'}); //60min
      
      const passwordResetTokenRequest = {
        id: user.id,
        passwordresettoken: passwordResetToken,
      };
      // Update refresh token in database
      //this.authRepository.addPasswordResetToken(passwordResetTokenRequest);
      
      return {passwordResetToken: passwordResetToken, email: user.email};
    } catch (err) {
      this.loggingService.error('Error creating password reset token.', err);
    }
  }
  
  async verifyPasswordResetToken(passwordResetToken: string) {
    try{
      const payload = jwt.verify(passwordResetToken, this.configurationService.FUELIFY_APP_ACCESS_SECRET);
      //@ts-ignore
      if(payload && payload.user) {
        /*const getTokenResult = await this.authRepository.getPasswordResetToken(payload.user.id);
        if(getTokenResult.passwordResetToken === passwordResetToken) {
          return payload;
        } else {
          this.loggingService.warn('unable to parse passwordresettoken');
        }*/
        return payload
      } else {
        this.loggingService.warn('Unable to parse password reset token');
      }
    } catch (err) {
      this.loggingService.error('Error verifying password reset token.', err);
    }
  }



}

export default TokenService;
