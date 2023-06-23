import { Router, Request, Response, NextFunction } from 'express';
import ResponseModel from '../models/response-model';
// @ts-ignore
import { userService, requestErrors, responseModel } from container.cradle;

interface Dependencies {
  userService: userService;
  requestErrors: requestErrors;
  responseModel: ResponseModel;
}

module.exports = function({ userService, requestErrors, responseModel }: Dependencies) {
    
  
  async function login(req: any, res: any, next: NextFunction) {
    try {
      const response: ResponseModel = await userService.login(req.body.email, req.body.password, req.body.provider);
      console.log(response)
      if(response.statusCode === 200) {
        res.status(response.statusCode).send(response);
      } else {
        switch(response.statusCode) {
          case 400 :
            return next(requestErrors.badRequest400(response.message));
          case 401 :
            return next(requestErrors.unauthorized401(response.message));
          case 403 :
            return next(requestErrors.forbidden403(response.message));
          case 404 :
            return next(requestErrors.notFound404(response.message));
          case 500 :
            return next(requestErrors.internalServerError500(response.message));
          default:
            return next(requestErrors.internalServerError500('Unhandled Error'));
        }
      }
    } catch (err) {
      console.log(err)
      return next(requestErrors.internalServerError500('Unhandled error at login.'));
    }
  }

  /*async function registerCreator(req: Request, res: Response, next: NextFunction) {
    const userInput = req.body;
    
    try {
      userInput.email = userInput.email.toLowerCase();

      // Validate user input
      const result = await validator.validate(NewCreator, userInput);
      if(result !== true) {
        const message = 'Invalid data specified: ' + ((result[0]) ? result[0].message : 'undefined');
        logger.warn(message, result);
        return next(requestErrors.badRequest400(message));
      }

      const user = await creatorsService.createCreator(userInput);

      if(!returnError.hasError(user)) {
        logger.info('Register user success. User: ' + user.email);
        // Follow regular feeds
        await socialService.batchFollow(user, user.KollektivId);
        // Follow notification feeds
        await socialService.batchFollow(user, user.KollektivId, 'notification');
        return res.send({ user, success: true });
      }
      const message = 'Unable to create user.';
      logger.error(message + ' User: ' + (userInput.email || ''));
      return next(requestErrors.badRequest400(message));
    } catch(err) {
      const message = 'Unable to create user.';
      logger.error(message + ' User: ' + (userInput.email || ''), err);
      return next(requestErrors.badRequest400(message));
    }
  }
  
  async function updateCreatorProfile(req, res, next) {
    try {
      const userInput = req.body;
      userInput.id = req.user.id;

      // Validate user input
  //    const output = {};
  //    const validator = container.resolve('validator');
  //    if(! await validator.ValidateNewCreator(user_input, output)) {
  //      const logmessage1 = 'Invalid data. Unable to create user.';
  //        logger.warn({
  //          userid: user_input.email,
  //          obj_function: 'register', 
  //          file: 'user', 
  //          message: logmessage1,
  //          err: output.errors});
  //      return next(requestErrors.badRequest400(logmessage1));
  //    }

      const user = await creatorsService.updateCreatorProfile(userInput);

      if(!returnError.hasError(user)) {
        logger.info('Update creator profile success. User: ' + userInput.id);
        res.send({user, success: true});
      }

      const message = 'Unable to update user profile.';
      logger.warn(message + ' User: ' + userInput.id, user);
      return next(requestErrors.badRequest400(message));
    } catch(err) {
      const message = 'Unable to update user profile.';
      logger.error(message + ' User: ' + userInput.id, err);
      return next(requestErrors.internalServerError500(message));
    }
  }
  
  async function getCreator(req, res, next) {
    try {
      const user = await creatorsService.getCreator(req.user.id);
      res.send(user);
    } catch (err) {
      const message = 'Unhandled error at get creator details.';
      logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id));
      return next(requestErrors.internalServerError500(message));
    }
  }
  
  async function refreshToken(req, res, next) {
    try {
      const userInput = req.body;

      // Validate the refreshtoken
      const payload = await tokenService.verifyRefreshToken(userInput.refreshtoken);
      if(payload !== null) {
        const jwtUser = payload.payload;

        // Getuser
        const user = await creatorsService.getCreator(jwtUser.id);

        // Create new tokens
        const tokens = await tokenService.createRefreshTokenAndAccessToken(user);
        if(tokens) {
          res.send(tokens);
        }

        const message = 'Unable to create new token!';
        logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id));
        return next(requestErrors.badRequest400(message));
      } else {
        const message = 'Missing payload in refresh token.';
        logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id));
        return next(requestErrors.unauthorized401(message));
      }
    } catch (err) {
      const message = 'Refresh token failed.';
      logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id), err);
      return next(requestErrors.internalServerError500(message));
    }
  }
  
  async function updateProfileImage(req, res, next) {
    try {
      if(!req.body.image) {
        const message = 'No files uploaded.';
        logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id));
        return next(requestErrors.badRequest400(message));
      } else {
        const uriDecodedImage = decodeURI(req.body.image);
        const profileImage = decodeBase64Image(uriDecodedImage);
        const success = await creatorsService.addProfileImage(req.user, profileImage);
        res.send(success);
      }
    } catch(err) {
      const message = 'Unable to store image.';
      logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id), err);
      return next(requestErrors.internalServerError500(message));
    }
  }
  
  async function getProfileImage(req, res, next) {
    try {
      const user = req.user;

      const image = await creatorsService.getProfileImage(user);
      if(image === null) {
        res.send({ success: false, message: 'Profile has no image!' });
      } else {
        res.set('Content-Type', image.ContentType);    
        res.send(image.Body);
      }   
    } catch(err) {
      const message = 'Unable to get image.';
      logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id), err);
      return next(requestErrors.internalServerError500(message));
    }
  }
  
  async function deleteProfileImage(req, res, next) {
    try {    
      const user = req.user;
      const imageResult = await creatorsService.deleteProfileImage(user);

      res.send(imageResult);
    } catch(err) {
      const message = 'Unable to get image.';
      logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id), err);
      return next(requestErrors.internalServerError500(message));
    }
  }
  
  function decodeBase64Image(dataString) {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (matches.length !== 3) {
      return new Error('Invalid input string');
    }

    return {
      type: matches[1],
      data: new Buffer.from(matches[2], 'base64')
    };
  }
  
  async function updateEmail(req, res, next) {
    try {
      const userInput = req.body;
      userInput.id = userInput.email;// use email as userid when loggin in

      res.status(501).send({success: true, message: 'NOT IMPLEMENTED'});
    } catch(err) {
      const message = 'Unable to store email.';
      logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id), err);
      return next(requestErrors.internalServerError500(message));
    }
  }
  
  async function updatePassword(req, res, next) {
    try {
      const userInput = req.body;
      const user = await creatorsService.getCreator(req.user.id, false);

      if(user !== null) {
        if(user.salt === null) {
          throw requestErrors.internalServerError500('Missing Salt value in setpassword!');
        }
        const hashedPassword = await encryptionService.genHash(userInput.password, user.salt); // Hashing will fail if it's not a valid Salt format($Vers$log2(NumRounds)$saltvalue)
        if(user.password === hashedPassword) {
          // Hashing password
          const salt = await encryptionService.genSalt(10);
          user.salt = salt; // set a new salt
          user.password = await encryptionService.genHash(userInput.newpassword, salt);

          res.send(await creatorsService.updateCreator(user));
        }
        const message = 'Incorrect username or password.';
        logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id));
        return next(requestErrors.unauthorized401(message));
      } else {
        const message = 'Creator not found.';
        logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id));
        return next(requestErrors.unauthorized401(message));
      }
    } catch(err) {
      const message = 'Unable to store new password.';
      logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id, err));
      return next(requestErrors.internalServerError500(message));
    }
  }
  
  async function resetPassword(req, res, next) {
    try {
      const resetResult = await creatorsService.resetCreatorPassword(req.body);
      if(resetResult.success) {
        res.status(200).send(resetResult);
      } else {
        const message = 'Unable to reset password.';
        logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id));
        return next(requestErrors.badRequest400(message));
      }
    } catch (err) {
      const message = 'Reset user password failed.';
      logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id), err);
      return next(requestErrors.internalServerError500(message));
    }
  }
  
  async function changeCreatorPassword(req, res, next) {
    try {
      const salt = await encryptionService.genSalt(10);

      const passwordResetRequest = {
        id: req.body.email,
        email: req.body.email,
        password: await encryptionService.genHash(req.body.password, salt),
        salt: salt,
      };

      // Validate reset token
      const passwordResetTokenResult = await creatorsService.verifyPasswordResetToken(passwordResetRequest, req.body.passwordresettoken);

      res.send(passwordResetTokenResult);

    } catch (err) {
      const message = 'Reset user password failed.';
      logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id), err);
      return next(requestErrors.internalServerError500(message));
    }
  }
  
  async function addAppNotificationToken(req, res, next) {
    try {
      const userInput = req.body;    
      const apptoken = userInput.appnotificationtoken;
      const operatingsystem = userInput.operatingsystem;
      notificationtokenService.addNotificationToken(req.user, apptoken, operatingsystem)
      res.send({success: true});

    } catch(err) {
      const message = 'Unable to store new apptoken.';
      logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id), err);
      return next(requestErrors.internalServerError500(message));
    }
  }
  
  async function checkCreatorExists(req, res, next) {
    try {
      const userInput = req.body;    
      const exists = await creatorsService.emailExists( { 'email': userInput.email });

      res.send({ 'Result': { 'EmailExists': exists } });

    } catch(err) {
      const message = 'Unable to check if email exists.';
      logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id), err);
      return next(requestErrors.internalServerError500(message));
    }
  }*/
  
  return {
      login,
      /*registerCreator,
      updateCreatorProfile,
      getCreator,
      refreshToken,
      updateProfileImage,
      getProfileImage,
      deleteProfileImage,
      updateEmail,
      updatePassword,
      resetPassword,
      changeCreatorPassword,
      addAppNotificationToken,
      checkCreatorExists*/
  };
};