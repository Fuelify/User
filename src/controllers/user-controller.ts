import { Router, Request, Response, NextFunction } from 'express';
import ResponseModel from '../models/response-model';
// @ts-ignore
import { userService, requestErrors, responseModel } from container.cradle;

interface Dependencies {
  userService: userService;
  requestErrors: requestErrors;
  responseModel: ResponseModel;
}

// TODO: Add validation, migrate to class
module.exports = function({ userService, requestErrors, responseModel }: Dependencies) {
    
  
  async function loginUser(req: any, res: any, next: NextFunction) {
    try {
      const response: ResponseModel = await userService.loginUser(req.body.email, req.body.password, req.body.provider);
      res.status(response.statusCode).send(response);
    } catch (err) {
      console.log(err)
      return next(requestErrors.internalServerError500('Unhandled error at login.'));
    }
  }

  async function createUser(req: any, res: any, next: NextFunction) {
    try {
      const userInput = req.body;
      // Enforce all lowercase emails
      userInput.email = userInput.email.toLowerCase();

      //TODO Validate user input
      /*const result = await validator.validate(NewCreator, userInput);
      if(result !== true) {
        const message = 'Invalid data specified: ' + ((result[0]) ? result[0].message : 'undefined');
        logger.warn(message, result);
        return next(requestErrors.badRequest400(message));
      }*/

      const response: ResponseModel = await userService.createUser(userInput.email, userInput.password, userInput.family, userInput.provider);
      res.status(response.statusCode).send(response);
    } catch(err: any) {
      const message = 'Unable to create user.';
      console.log(message + ' User: ' + (req.body.email || ''), err.toString());
      return next(requestErrors.internalServerError500('Unhandled error at user creation.'));
    }
  }

  async function refreshTokens(req: any, res: any, next: NextFunction) {
    try {
      const response: ResponseModel = await userService.refreshTokens(req.body.refreshToken);
      res.status(response.statusCode).send(response);
    } catch (err) {
      return next(requestErrors.internalServerError500('Unhandled error at token refresh.'));
    } 
  }

  async function getUser(req: any, res: any, next: NextFunction) {
    try {
      //const response: ResponseModel = await userService.getUser(req.user.id);
      //User already fetched in auth middleware
      const response: ResponseModel = new ResponseModel(200,'success','User fetched successfully',req.user.toSanitizedJson());
      res.status(response.statusCode).send(response);
    } catch (err) {
      return next(requestErrors.internalServerError500('Unhandled error while retrieving user.'));
    } 
  }

  async function logoutUser(req: any, res: any, next: NextFunction) {
    try {
      const response: ResponseModel = await userService.logoutUser(req.user, req.header('Authorization').split(" ")[1]);
      res.status(response.statusCode).send(response);
    } catch (err) {
      return next(requestErrors.internalServerError500('Unhandled error while logging user out.'));
    } 
  }

  async function deleteUser(req: any, res: any, next: NextFunction) {
    try {
      const response: ResponseModel = await userService.deleteUser(req.user);
      res.status(response.statusCode).send(response);
    } catch (err) {
      return next(requestErrors.internalServerError500('Unhandled error while deleting user.'));
    } 
  }

  async function changePassword(req: any, res: any, next: NextFunction) {
    try {
      const response: ResponseModel = await userService.changePassword(req.user,req.body.oldPassword,req.body.newPassword);
      res.status(response.statusCode).send(response);
    } catch (err) {
      return next(requestErrors.internalServerError500('Unhandled error while attempting to change user password.'));
    } 
  }

  async function resetPassword(req: any, res: any, next: NextFunction) {
    try {
      const response: ResponseModel = await userService.resetPassword(req.body.email,req.body.password);
      res.status(response.statusCode).send(response);
    } catch (err) {
      return next(requestErrors.internalServerError500('Unhandled error while attempting to reset user password.'));
    } 
  }

  async function sendPasswordResetEmail(req: any, res: any, next: NextFunction) {
    try {
      const response: ResponseModel = await userService.sendPasswordResetEmail(req.body.email);
      res.status(response.statusCode).send(response);
    } catch (err) {
      return next(requestErrors.internalServerError500('Unhandled error while attempting to send password reset email'));
    } 
  }

  
  
  /*
  
  
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
      loginUser,
      createUser,
      refreshTokens,
      getUser,
      logoutUser,
      deleteUser,
      changePassword,
      resetPassword,
      sendPasswordResetEmail,
      /*
      updateProfileImage,
      getProfileImage,
      deleteProfileImage,
      updateEmail,
      updatePassword,
      resetPassword,
      addAppNotificationToken,
      checkCreatorExists*/
  };
};