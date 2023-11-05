import ConfigurationService from "../services/configuration-service";
import LoggingService from "../services/logging-service";
import {AWSServices} from "../modules/aws-module";
import ResponseModel from "../models/response-model";
import UserModel from "../models/user-model";
import { DeleteCommand, DeleteCommandOutput, GetCommand, GetCommandInput, GetCommandOutput, PutCommand, PutCommandOutput, QueryCommand, QueryCommandOutput, UpdateCommand, UpdateCommandInput, UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";

interface Dependencies {
    configurationService: ConfigurationService;
    loggingService: LoggingService;
    responseModel: typeof ResponseModel;
    awsModule: AWSServices;
  }
  
class UserRepository {
    configurationService: ConfigurationService;
    loggingService: LoggingService;
    responseModel: typeof ResponseModel;
    aws: AWSServices;
  
    constructor({ loggingService, configurationService, responseModel, awsModule }: Dependencies) {
      this.configurationService = configurationService;
      this.loggingService = loggingService;
      this.responseModel = responseModel;
      this.aws = awsModule;
    }

    async createUser(user: UserModel) {
      
      try {
        const params = {
            TableName: this.configurationService.FUELIFY_USER_DYNAMODB_TABLENAME,
            Item: user.toDatabase()
        };
        
        const command = new PutCommand(params);

        const response: PutCommandOutput = await this.aws.dynamo().send(command);

        return new ResponseModel(200, "success", "User successfully created in the database!", user.toSanitizedJson());
        
      } catch (err: any) {
          this.loggingService.error("Error occurred while attempting to create user in database",err)
          return new ResponseModel(500, "error", "Error occurred while attempting to create user in database",err.toString());
      }

    }

    async updateUser(user: UserModel) {
    }

    async deleteUser(user: UserModel) {
      try {
        const params = {
          TableName: this.configurationService.FUELIFY_USER_DYNAMODB_TABLENAME,
          Key: {
            ID : user.id,
            FAMILY: user.family
          }
        };

        const command = new DeleteCommand(params);

        const response: DeleteCommandOutput = await this.aws.dynamo().send(command);

        return new ResponseModel(200, "success", "User successfully deleted from the database!");
        
      } catch (err: any) {
        this.loggingService.error("Error occurred while deleting user from database",err)
        return new ResponseModel(500, "error", "Error occurred while deleting user from database",err.toString());
      }
    }
    
    
    async getUserByEmail(email: string) {
        try {
            const params = {
                IndexName: 'Login-Index',
                TableName: this.configurationService.FUELIFY_USER_DYNAMODB_TABLENAME,
                KeyConditionExpression: '#pk = :id and #sk = :family',
                ExpressionAttributeNames: {
                  '#pk': 'Email',
                  '#sk': 'FAMILY',
                },
                ExpressionAttributeValues: {
                  ':id': email,
                  ':family': 'USER',
                },
                //Key: {
                //  'Email': email,
                //  'FAMILY': 'USER'
                //}
            };

            const command = new QueryCommand(params);

            const response: QueryCommandOutput = await this.aws.dynamo().send(command);
            
            // Identify if user was found in database
            if (response.Items && response.Items.length > 0) {
                // Extract user data from returned query
                return UserModel.fromJson(response.Items[0]);
          } else {
              return new ResponseModel(400, "error", "User does not yet exist in the database!");
          }
      } catch (err: any) {
          this.loggingService.error("Error occurred while fetching user from database",err)
          return new ResponseModel(500, "error", "Error occurred while fetching user from database",err.toString());
      }

    }
    
    async getUserById(userId: string, family: string = 'USER') {
        try {
            const params: GetCommandInput = {
                TableName: this.configurationService.FUELIFY_USER_DYNAMODB_TABLENAME,
                Key: {
                  'ID': userId,
                  'FAMILY': family
                }
            };

            const command = new GetCommand(params);

            const response: GetCommandOutput = await this.aws.dynamo().send(command);
            
            // Identify if user was found in database
            if (response.Item) {
                // Extract user data from returned query
                return UserModel.fromJson(response.Item);
          } else {
              return new ResponseModel(400, "error", "User does not yet exist in the database!");
          }
      } catch (err: any) {
          this.loggingService.error("Error occurred while fetching user from database",err)
          return new ResponseModel(500, "error", "Error occurred while fetching user from database",err.toString());
      }

    }

    async updateUserPassword(user: UserModel) {

      try {
          const params: UpdateCommandInput = {
              TableName: this.configurationService.FUELIFY_USER_DYNAMODB_TABLENAME,
              Key: {
                  'ID' : user.id,
                  'FAMILY': user.family
              },
              UpdateExpression: "SET Passwords = :Passwords, Salt = :Salt",
              ExpressionAttributeValues: {
                  ':Passwords': user.passwords,
                  ':Salt': user.salt
              }
          };

          const command = new UpdateCommand(params);

          const response: UpdateCommandOutput = await this.aws.dynamo().send(command);

          return new ResponseModel(200, "success", "User password updated in the database!");
          
      } catch (err: any) {
          this.loggingService.error("Error occurred while attempting to update user password in database",err)
          return new ResponseModel(500, "error", "Error occurred while attempting to update user password in database",err.toString());
      }
  }

}

export default UserRepository;