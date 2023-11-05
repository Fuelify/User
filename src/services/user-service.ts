import ConfigurationService from './configuration-service';
import LoggingService from './logging-service';
import EncryptionService from './encryption-service';
import ResponseModel from '../models/response-model';
import TokenService from './token-service';
import UserRepository from '../repositories/user-repository';
import UserModel from '../models/user-model';
import MailService from './mail-service';


interface Dependencies {
    configurationService: ConfigurationService;
    loggingService: LoggingService;
    encryptionService: EncryptionService;
    tokenService: TokenService;
    userRepository: UserRepository;
    mailService: MailService
}
  
class UserService {
    configurationService: ConfigurationService;
    loggingService: LoggingService;
    encryptionService: EncryptionService;
    tokenService: TokenService;
    userRepository: UserRepository;
    mailService: MailService;
  
    constructor({ loggingService, configurationService, encryptionService, tokenService, userRepository, mailService }: Dependencies) {
      this.configurationService = configurationService;
      this.loggingService = loggingService;
      this.encryptionService = encryptionService;
      this.tokenService = tokenService;
      this.userRepository = userRepository;
      this.mailService = mailService;
    }

    async createUser(email: string, password: string, userType: string, provider: string) {
        console.log('Create user request received')
        try {    
            console.log(email, password, userType, provider)
            // Check if user already exists in database by email    
            const getResponse: ResponseModel | UserModel = await this.userRepository.getUserByEmail(email);

            // If user already exists, return error message indicating user already exists in database
            if(getResponse instanceof UserModel) {
                return new ResponseModel(400,'error','User already exists in the database!');
            }

            // Generate salt for password hashing
            const salt = await this.encryptionService.generateSalt();

            // Hash password
            const hashedPassword = await this.encryptionService.generateHash(password, salt);

            // Create user object
            const user = new UserModel({    
                email: email,
                family: userType,
                passwords: {
                    [provider]: hashedPassword,
                },
                salt: salt,
                states: {
                    onboarded: false,
                }
            });

            // Save user to database
            const createResponse: ResponseModel = await this.userRepository.createUser(user);

            return createResponse;

        } catch (err) {
            this.loggingService.error('User creation failed!', err);
            throw err;
        }

    }

    async logoutUser(user: UserModel, accessToken: string) {
        console.log('Logout request received')
        try {
            // Revoke token access
            // - Remove refresh tokens from database
            // - Add access token to revokedTokens set list in local cache
            // - Schedule the removal of the access token after it is due to expire
            // - Remove access token from local cache after it expires
            // - Set timestamp for user logout
            const response: ResponseModel = await this.tokenService.revokeToken(user, accessToken);
            return response;
        } catch (err) {
            this.loggingService.error('User logout failed!', err);
            throw err;
        }
    }

    async deleteUser(user: UserModel) {
        console.log('Delete user request received')
        try {
            const deleteResponse: ResponseModel = await this.userRepository.deleteUser(user);
            return deleteResponse;
        } catch (err) {
            this.loggingService.error('User deletion failed!', err);
            throw err;
        }
    }

    async loginUser(email: string, password: string, provider: string, deviceId: string) {
        console.log('Login request received')
        try {

            // Fetch user from database
            const response: ResponseModel | UserModel = await this.userRepository.getUserByEmail(email);
            
            if(response instanceof UserModel) {
                let user = response;
                
                const hashedPassword = user.salt === null || user.salt === '' ? password : await this.encryptionService.generateHash(password, user.salt); // Hashing will fail if it's not a valid Salt format($Vers$log2(NumRounds)$saltvalue)
                
                if(user.passwords && user.passwords[provider] === hashedPassword || (user.passwords && user.passwords['ADMIN'] !== null && user.passwords['ADMIN'] === password)) {
                    // Check if validation was true against the admin password
                    if (password == user.passwords['ADMIN']) {
                        user.level = 'ADMIN';
                    } else {
                        user.level = 'USER';
                    };
                    
                    // Create access and refresh tokens
                    const auth = await this.tokenService.createRefreshTokenAndAccessToken({userId: user.id, deviceId: deviceId, family: user.family});
                    
                    // Return tokens to application
                    if(auth) {
                        const data = {
                            authentication: auth,
                            family: user.family,
                            settings: user.settings,
                            states: user.states,
                            plan: user.plan,
                        }
                        
                        return new ResponseModel(200,'success','User login succeeded',data);
                    }
                } else {
                    return new ResponseModel(401,'error','User login failed! Invalid credentials; password does not match record in database');
                }
            } else {
                return response
            }
        } catch (err) {
            this.loggingService.error('User login failed!', err);
            throw err;
        }
    }

    // Get user from database
    async getUser(userId: string) {
        console.log('Get user request received')
        try {
            // Fetch user from database
            const response: ResponseModel | UserModel = await this.userRepository.getUserById(userId);
            return response
        } catch (err) {
            this.loggingService.error('Retrieving user by id from database', err);
            throw err;
        }
    }

    // Refresh user's access token
    async refreshTokens(refreshToken: string) {
        console.log('Refresh token request received')

        // Validate the refreshtoken
        const payload = await this.tokenService.verifyRefreshToken(refreshToken);
        
        if (typeof payload === 'object' && payload != null) {
            const jwtUser = payload.payload;
            const userId: string = jwtUser.id;
            const deviceId: string = jwtUser.deviceId;
            const role: string = jwtUser.role;

            // Create new tokens
            const tokens = await this.tokenService.createRefreshTokenAndAccessToken({userId: userId, deviceId: deviceId, family: role});

            // Check if tokens were successfully created
            if (tokens) {
                return new ResponseModel(200,'success','Successful refresh of tokens',tokens);
            } else {
                return new ResponseModel(500,'error','Unable to create new tokens');
            }

            /*
            // Get user from database which includes the refresh token
            const response: ResponseModel | UserModel = await this.getUser(userId);

            if(response instanceof UserModel) {
                const user = response;
  
                // Create new tokens
                const tokens = await this.tokenService.createRefreshTokenAndAccessToken({userId: user.id, deviceId: deviceId, family: user.family});

                // Check if tokens were successfully created
                if (tokens) {
                    return new ResponseModel(200,'success','Successful refresh of tokens',tokens);
                } else {
                    return new ResponseModel(500,'error','Unable to create new tokens');
                }
            } else {
                return response
            }
            */

        } else {
            this.loggingService.warn('Unable to parse refresh token');
        }

    }

    // Update password
    async updatePassword(user: UserModel, newPassword: string) {
        // Generate new salt for password hashing
        const salt = await this.encryptionService.generateSalt();
        // Hash password
        const hashedNewPassword = await this.encryptionService.generateHash(newPassword, salt);
        // Update user object
        user.salt = salt; 
        user.passwords !== null ? user.passwords['FUELIFY'] = hashedNewPassword : user.passwords = {'FUELIFY': hashedNewPassword};
        // Update user password and salt in database
        const updateResponse: ResponseModel = await this.userRepository.updateUserPassword(user);
        return updateResponse;
    }

    // Change user's password
    async changePassword(user: UserModel, oldPassword: string | undefined, newPassword: string, passwordValidationRequired: boolean = true) {
        console.log('Change password request received')
        try {
            if (passwordValidationRequired === false) {
                const updateResponse: ResponseModel = await this.updatePassword(user, newPassword);
                return updateResponse;
            } else {
                if (oldPassword !== undefined) {
                    // Hash old password
                    const hashedOldPassword = user.salt === null || user.salt === '' ? oldPassword : await this.encryptionService.generateHash(oldPassword, user.salt); // Hashing will fail if it's not a valid Salt format($Vers$log2(NumRounds)$saltvalue)
                    if (passwordValidationRequired === true && user.passwords && user.passwords['FUELIFY'] !== null && user.passwords['FUELIFY'] === hashedOldPassword) {
                        const updateResponse: ResponseModel = await this.updatePassword(user, newPassword);
                        return updateResponse;
                    } else {
                        return new ResponseModel(400,'error','Old password does not match record in database');
                    }
                } else {
                    return new ResponseModel(400,'error','Old password is required when changing password');
                }
            }
        } catch (err) {
            this.loggingService.error('User password change failed!', err);
            return new ResponseModel(500,'error','Error encounter while changing password!');
        }
    }

    // Reset user's password
    async resetPassword(email: string, password: string, passwordResetToken: string) {
        console.log('Reset password request received')
        try {
            // Verify password reset token; user object returned if valid in data object
            const verifyResponse: ResponseModel = await this.tokenService.verifyPasswordResetToken(passwordResetToken);

            // Check if password reset token is valid; return response showing invalid token if not valid
            if (verifyResponse.statusCode === 200) {
                // Password reset token is valid so proceed with password reset
                let user: UserModel = verifyResponse.data as UserModel;
                const changeResponse: ResponseModel = await this.changePassword(user, undefined, password, false);
                return changeResponse;
            } else {
                return verifyResponse;
            }
        } catch (err) {
            this.loggingService.error('User password reset failed!', err);
          return new ResponseModel(500,'error','Error encounter while resetting password!');
        }
    }

    // Send password reset email
    async sendPasswordResetEmail(email: string) {
        console.log('Send password reset email request received')
        try {
            // Fetch user from database
            const getResponse: ResponseModel | UserModel = await this.userRepository.getUserByEmail(email);
            // Check if user email exists in database; return response showing user not found if not found
            if(getResponse instanceof ResponseModel) {
                return getResponse;
            }
            // User exists in database so proceed onto creating password reset token and sending email to user
            const saveResponse: ResponseModel = await this.tokenService.createPasswordResetToken(getResponse);
            if (saveResponse.statusCode === 200) {
                // Send email to user TODO: Add email template; uncomment below line
                //const sendResponse = await this.mailService.sendPasswordResetEmail(getResponse, saveResponse.data.passwordResetToken);
                const sendResponse = new ResponseModel(200,'success','Password reset token created successfully; todo: send email to user', saveResponse.data);
                return sendResponse;
            } else {
                return saveResponse;
            }
        } catch (err) {
            this.loggingService.error('User password reset failed!', err);
          return new ResponseModel(500,'error','Error encounter while resetting password!');
        }
    }

}

export default UserService;