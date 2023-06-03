import { Router, Request, Response, NextFunction } from 'express';
//const { unauthorized401, internalServerError500 } = require("../errors/requestErrors.js");

import TokenService from '../services/token-service'
import UserService from '../services/user-service';

interface Dependencies {
  tokenService: TokenService;
  userService: UserService;
  requestErrors: any
  logger: any
}

module.exports = function ({ logger, tokenService, userService, requestErrors }: Dependencies) {
    async function verifyApiToken(req: any, res: Response, next: NextFunction) {
        try {
            const apikey = req.header('Api-key');
            if(!apikey) {
                logger.warn('Missing Api-Key');
                return next(requestErrors.unauthorized401('Missing Api-Key'));
            }

            const token = await tokenService.getAPIToken(apikey);
            if(token !== null) {
                //req.API_SCOPE = token.scope;
            } else {
                logger.warn('Invalid Api-Key');
                return next(requestErrors.unauthorized401('Invalid Api-Key'));
            }
            next();
        } catch (err) {
            logger.error('Error retrieving Api-Key', err);
            return next(requestErrors.internalServerError500('Error retrieving Api-Key'));
        }
    }

    async function verifyAdminToken(req: any, res: Response, next: NextFunction) {
        try {
            const adminkey = req.header('Admin-Key');
            if(!adminkey) {
                logger.warn('Missing Admin-Key');
                return next(requestErrors.unauthorized401('Missing Admin-Key'));
            }

            const token = await tokenService.getAPIToken(adminkey);
            if(token !== null) {
                //req.API_SCOPE = token.scope;
            } else {
                logger.warn('Invalid Admin-Key');
                return next(requestErrors.unauthorized401('Invalid Admin-Key'));
            }
            next();
        } catch (err) {
            logger.error('Error retrieving Admin-Key', err);
            return next(requestErrors.internalServerError500('Error retrieving Admin-Key'));
        }
    }
    
    async function verifyToken(req: any, res: Response, next: NextFunction) {
        try {

          const authToken = req.header('Authorization');
          if(!authToken) {
            logger.warn('Missing Bearer Token');
            return next(requestErrors.unauthorized401('Missing Bearer Token'));
          }
          const accessToken = authToken.split(" ")[1];
          const jwtUser = await tokenService.verifyAccessToken(accessToken);
          if(jwtUser) {
            // Getting the stored user, as the JWT could have old data
            try {
              //@ts-ignore
              const response = await userService.getUser(jwtUser.payload.id);
              if(response.statusCode == 200) {
                req.user = response.user;
                next();
              } else {
                logger.warn('User does not exists!');
                return next(requestErrors.unauthorized401('User does not exists!'));
              }
            } catch(err) {
              logger.warn('Unfetchable user account');
              return next(requestErrors.internalServerError500('Error occurred while fetching user account'));
            }
          } else {
            logger.warn('Invalid Bearer Token');
            return next(requestErrors.unauthorized401('Invalid Bearer Token'));
          }
        } catch (err) {
          logger.error('Error retrieving Bearer Token', err);
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
            logger.error('Error enabling test sites', err);
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
            logger.error('Error enabling test sites', err);
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
          logger.error('Error enabling test sites', err);
          return next(requestErrors.internalServerError500('Error enabling test sites'));
        }
    }*/
    
    return {
        verifyAdminToken,
        verifyApiToken,
        verifyToken,
        //allowScope,
        //allowOnlyTestUser,
        //enableTestSites
    };
};