import ConfigurationService from "../services/configuration-service";
import LoggingService from "../services/logging-service";
import {AWSServices} from "../modules/aws-module";
import ResponseModel from "../models/response-model";
import UserModel from "../models/user-model";
import { DeleteCommand, DeleteCommandOutput, GetCommand, GetCommandInput, GetCommandOutput, PutCommand, PutCommandOutput, QueryCommand, QueryCommandOutput, UpdateCommand, UpdateCommandInput, UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";

interface AuthModel {
    id: string;
    family: string;
    refreshToken: string;
    refreshTokenExpiration: number | undefined;
}

interface PasswordResetModel {
    id: string;
    family: string;
    passwordResetToken: string;
}

interface Dependencies {
    configurationService: ConfigurationService;
    loggingService: LoggingService;
    responseModel: typeof ResponseModel;
    awsModule: AWSServices;
  }
  
class AuthRepository {
    configurationService: ConfigurationService;
    loggingService: LoggingService;
    aws: AWSServices;
  
    constructor({ loggingService, configurationService, awsModule }: Dependencies) {
      this.configurationService = configurationService;
      this.loggingService = loggingService;
      this.aws = awsModule;
    }   

    async saveRefreshToken(auth: AuthModel) {

        try {
            const params: UpdateCommandInput = {
                TableName: this.configurationService.FUELIFY_USER_DYNAMODB_TABLENAME,
                Key: {
                    'ID' : auth.id,
                    'FAMILY': auth.family
                },
                UpdateExpression: "SET RefreshToken = :RefreshToken, RefreshTokenExpiration = :RefreshTokenExpiration",
                ExpressionAttributeValues: {
                    ':RefreshToken': auth.refreshToken,
                    ':RefreshTokenExpiration': auth.refreshTokenExpiration
                }
            };

            const command = new UpdateCommand(params);

            const response: UpdateCommandOutput = await this.aws.dynamo().send(command);

            return new ResponseModel(200, "success", "User refresh token data successfully updated in the database!");
            
        } catch (err: any) {
            this.loggingService.error("Error occurred while attempting to save user refresh token data to database",err)
            return new ResponseModel(500, "error", "Error occurred while attempting to save use refresh token data in database",err.toString());
        }
    }

    async deleteRefreshToken(user: UserModel) {

        try {
            const params: UpdateCommandInput = {
                TableName: this.configurationService.FUELIFY_USER_DYNAMODB_TABLENAME,
                Key: {
                    'ID' : user.id,
                    'FAMILY': user.family
                },
                UpdateExpression: "REMOVE RefreshToken, RefreshTokenExpiration",
            };

            const command = new UpdateCommand(params);

            const response: UpdateCommandOutput = await this.aws.dynamo().send(command);

            return new ResponseModel(200, "success", "User logged out and refresh token data successfully removed in the database!");
            
        } catch (err: any) {
            this.loggingService.error("Error occurred while attempting to remove user refresh token data in database",err)
            return new ResponseModel(500, "error", "Error occurred while attempting to remove user refresh token data in database",err.toString());
        }
    }
      
    async savePasswordResetToken(reset: PasswordResetModel) {

        try {
            const params: UpdateCommandInput = {
                TableName: this.configurationService.FUELIFY_USER_DYNAMODB_TABLENAME,
                Key: {
                    'ID' : reset.id,
                    'FAMILY': reset.family
                },
                UpdateExpression: "SET PasswordResetToken = :PasswordResetToken",
                ExpressionAttributeValues: {
                    ':PasswordResetToken': reset.passwordResetToken,
                }
            };

            const command = new UpdateCommand(params);

            const response: UpdateCommandOutput = await this.aws.dynamo().send(command);

            return new ResponseModel(200, "success", "User password reset token succesffuly saved in the database!",reset);
            
        } catch (err: any) {
            this.loggingService.error("Error occurred while attempting to save user reset password token to database",err)
            return new ResponseModel(500, "error", "Error occurred while attempting to save user reset password token in database",err.toString());
        }
    }
    

}

export default AuthRepository;