import ConfigurationService from "../services/configuration-service";
import LoggingService from "../services/logging-service";
import {AWSServices} from "../modules/aws-module";
import ResponseModel from "../models/response-model";
import UserModel from "../models/user-model";
import { GetCommand, GetCommandInput, GetCommandOutput, QueryCommand, QueryCommandOutput } from "@aws-sdk/lib-dynamodb";

interface Dependencies {
    configurationService: ConfigurationService;
    loggingService: LoggingService;
    responseModel: typeof ResponseModel;
    awsModule: AWSServices;
    userModel: typeof UserModel;
  }
  
class UserRepository {
    configurationService: ConfigurationService;
    loggingService: LoggingService;
    responseModel: typeof ResponseModel;
    aws: AWSServices;
    userModel: typeof UserModel;
  
    constructor({ loggingService, configurationService, responseModel, awsModule, userModel }: Dependencies) {
      this.configurationService = configurationService;
      this.loggingService = loggingService;
      this.responseModel = responseModel;
      this.aws = awsModule;
      this.userModel = userModel;
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
            if (response.Items) {
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
    
    async getUserById(userId: string) {
        try {
            const params: GetCommandInput = {
                TableName: this.configurationService.FUELIFY_USER_DYNAMODB_TABLENAME,
                /*KeyConditionExpression: '#pk = :id and #sk = :family',
                ExpressionAttributeNames: {
                  '#pk': 'ID',
                  '#sk': 'FAMILY',
                },
                ExpressionAttributeValues: {
                  ':id': userId,
                  ':family': 'USER',
                },*/
                Key: {
                  'ID': userId,
                  'FAMILY': 'USER'
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
}

export default UserRepository;