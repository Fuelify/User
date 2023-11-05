import { Router, Request, Response, NextFunction } from 'express';
//const { unauthorized401, internalServerError500 } = require("../errors/requestErrors.js");

import TokenService from '../services/token-service'
import UserService from '../services/user-service';
import LoggingService from '../services/logging-service';
import UserModel from '../models/user-model';

interface Dependencies {
  tokenService: TokenService;
  userService: UserService;
  requestErrors: any;
  loggingService: LoggingService;
}

module.exports = function ({ loggingService, tokenService, userService, requestErrors }: Dependencies) {
    async function verifyApiToken(req: any, res: Response, next: NextFunction) {
        try {
            const apikey = req.header('API-Key');
            if(!apikey) {
              loggingService.warn('Missing API-Key');
                return next(requestErrors.unauthorized401('Missing API-Key'));
            }

            const token = await tokenService.getAPIToken(apikey);
            if(token !== null) {
                //req.API_SCOPE = token.scope;
            } else {
                loggingService.warn('Invalid API-Key');
                return next(requestErrors.unauthorized401('Invalid API-Key'));
            }
            next();
        } catch (err) {
            loggingService.error('Error retrieving API-Key', err);
            return next(requestErrors.internalServerError500('Error retrieving API-Key'));
        }
    }

    async function verifyAdminToken(req: any, res: Response, next: NextFunction) {
        try {
            const adminkey = req.header('Admin-Key');
            if(!adminkey) {
                loggingService.warn('Missing Admin-Key');
                return next(requestErrors.unauthorized401('Missing Admin-Key'));
            }

            const token = await tokenService.getAPIToken(adminkey);
            if(token !== null) {
                //req.API_SCOPE = token.scope;
            } else {
                loggingService.warn('Invalid Admin-Key');
                return next(requestErrors.unauthorized401('Invalid Admin-Key'));
            }
            next();
        } catch (err) {
            loggingService.error('Error retrieving Admin-Key', err);
            return next(requestErrors.internalServerError500('Error retrieving Admin-Key'));
        }
    }
    
    async function verifyAccessToken(req: any, res: Response, next: NextFunction) {
        try {

          const authToken = req.header('Authorization');
          if(!authToken) {
            loggingService.warn('Missing Bearer Token');
            return next(requestErrors.unauthorized401('Missing Bearer Token'));
          }
          const accessToken = authToken.split(" ")[1];
          const jwtUser = await tokenService.verifyAccessToken(accessToken);
          if(jwtUser) {
            // Getting the stored user, as the JWT could have old data
            try {
              //@ts-ignore
              const response = await userService.getUser(jwtUser.payload.id);
              if(response instanceof UserModel) {
                req.user = response;
                next();
              } else {
                loggingService.warn('User does not exists!');
                return next(requestErrors.unauthorized401('User does not exists!'));
              }
            } catch(err) {
              loggingService.warn('Unfetchable user account');
              return next(requestErrors.internalServerError500('Error occurred while fetching user account'));
            }
          } else {
            loggingService.warn('Invalid Bearer Token');
            return next(requestErrors.unauthorized401('Invalid Bearer Token'));
          }
        } catch (err) {
          loggingService.error('Error retrieving Bearer Token', err);
          return next(requestErrors.internalServerError500('Error retrieving Bearer Token'));
        }
    }
    
    /*function allowScope(scope) {
        return function(req: Request, res: Response, next: NextFunction) {
          try {    
            if (scope == req.API_SCOPE) {
              next();
            } else {        
              return next(requestErrors.forbidden403('Only Allowed in Test Scope!'));
            }
          } catch (err) {
            loggingService.error('Error enabling test sites', err);
            return next(requestErrors.internalServerError500('Error enabling test sites'));
          }
        }
      }

    function allowOnlyTestUser(req: Request, res: Response, next: NextFunction) {
        return function(req: Request, res: Response, next: NextFunction) {
          try {    
            if (req.user && req.user.id.toLowerCase().startsWith('testuser') && req.user.id.toLowerCase().endsWith('ourkollektiv.com')) {
              next();
            } else {        
              return next(requestErrors.forbidden403('Only Test Users Allowed!'));
            }
          } catch (err) {
            loggingService.error('Error enabling test sites', err);
            return next(requestErrors.internalServerError500('Error enabling test sites'));
          }
        };
    }
    
    async function enableTestSites(req: Request, res: Response, next: NextFunction) {
        try {    
          if(configurationService.ENABLE_TEST_SITES === true) {
            next();
          } else {
            return next(requestErrors.forbidden403('Test site not allowed!'));
          }    
        } catch (err) {
          loggingService.error('Error enabling test sites', err);
          return next(requestErrors.internalServerError500('Error enabling test sites'));
        }
    }*/
    
    return {
        verifyAdminToken,
        verifyApiToken,
        verifyAccessToken,
        //allowScope,
        //allowOnlyTestUser,
        //enableTestSites
    };
};