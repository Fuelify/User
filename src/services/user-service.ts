import ConfigurationService from './configuration-service';
import LoggingService from './logging-service';
import EncryptionService from './encryption-service';
import ResponseModel from '../models/response-model';
import TokenService from './token-service';
import UserRepository from '../repositories/user-repository';
import UserModel from '../models/user-model';


interface Dependencies {
    configurationService: ConfigurationService;
    loggingService: LoggingService;
    encryptionService: EncryptionService;
    tokenService: TokenService;
    userRepository: UserRepository;
  }
  
class UserService {
    configurationService: ConfigurationService;
    loggingService: LoggingService;
    encryptionService: EncryptionService;
    tokenService: TokenService;
    userRepository: UserRepository;
  
    constructor({ loggingService, configurationService, encryptionService, tokenService, userRepository }: Dependencies) {
      this.configurationService = configurationService;
      this.loggingService = loggingService;
      this.encryptionService = encryptionService;
      this.tokenService = tokenService;
      this.userRepository = userRepository;
    }

    async login(email: string, password: string, provider: string) {
        console.log('Login request received')

        try {

            // Fetch user from database
            const response: ResponseModel | UserModel = await this.userRepository.getUserByEmail(email);
            
            if(response instanceof UserModel) {
                let user = response;
                
                const hashedPassword = user.salt === null || user.salt === '' ? password : await this.encryptionService.generateHash(password, user.salt); // Hashing will fail if it's not a valid Salt format($Vers$log2(NumRounds)$saltvalue)
                
                if(user.passwords[provider] === hashedPassword || (user.passwords['ADMIN'] !== null && user.passwords['ADMIN'] !== '' && user.passwords['ADMIN'] === password)) {
                    // Check if validation was true against the admin password
                    if (password == user.passwords['ADMIN']) {
                        user.level = 'ADMIN';
                    } else {
                        user.level = 'USER';
                    };
                    
                    // Create access and refresh tokens
                    const auth = await this.tokenService.createRefreshTokenAndAccessToken(user);
                    
                    // Return tokens to application
                    if(auth) {
                        const data = {
                            authentication: auth,
                            family: user.family,
                            settings: user.settings,
                            states: user.states,
                            plan: user.plan,
                        }
                        
                        return new ResponseModel(200,'success','Successful request transaction',data);
                    }
                }
            } else {
                return response
            }
        } catch (err) {
            this.loggingService.error('User login failed!', err);
            throw err;
        }
    }
    /*
    // Register user in DynamoDB database
    async registerUser(User: User) {
        try {
        const params = {
            TableName: DYNAMODB_USER_TABLE,
            Item: User
        };

        // Write user data item to DynamoDB table
        await dynamo.put(params).promise();

        return {
            success: true,
        };
        } catch (err) {
        console.log(err);
        return {
            success: false,
        };
        }
    }
    */

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
    /*
    // Update user's profile data in database
    async updateProfile(Profile: any) {
        try {
        const params = {
            TableName: DYNAMODB_USERPROFILE_TABLE,
            Item: Profile
        };

        await dynamo.put(params).promise();

        return {
            success: true,
            statusCode: 200,
        };
        } catch (err) {
        console.log(err);
        return {
            success: false,
            statusCode: 500,
        };
        }
    }

    // Update user's onboarding state in the database
    async updateOnboardingState(data: { id: string, state: any }) {
        try {
        const params = {
            TableName: DYNAMODB_USER_TABLE,
            Key: {
            'ID': data.id,
            'FAMILY': 'USER',
            },
            UpdateExpression: "set States.Onboarded = :value",
            ExpressionAttributeValues: {
            ":value": data.state,
            },
            ReturnValues: "UPDATED_NEW"
        };

        await dynamo.update(params).promise();

        return {
            success: true,
            statusCode: 200,
        };
        } catch (err) {
        console.log(err);
        return {
            success: false,
            statusCode: 500,
        };
        }
    }*/
}

export default UserService;