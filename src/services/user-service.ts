//import AWS from "aws-sdk";

// Load the AWS Credentials.
//AWS.config.loadFromPath('./config.json');

// Create DynamoDB document client
//const dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

import AWSServices from '../modules/aws-module'
const awsServices = AWSServices({});
const dynamo = awsServices.dynamo();


// Pass any required dependencies within the empty object



// Set DynamoDB table names and user api url
const stage: string = process.env.ENVIRONMENT ? process.env.ENVIRONMENT : 'Staging';
let DYNAMODB_USER_TABLE: string;
let DYNAMODB_USERPROFILE_TABLE: string;

if (stage) {
  DYNAMODB_USER_TABLE = `${stage}-User`;
  DYNAMODB_USERPROFILE_TABLE = `${stage}-UserProfile`;
} else { // default to staging environment
  DYNAMODB_USER_TABLE = "Staging-User";
  DYNAMODB_USERPROFILE_TABLE = "Staging-UserProfile";
}

interface User {
  ID: string;
}

class UserService {

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

  // Get user from DynamoDB database
  async getUser(userId: string) {
    try {
      const params = {
        TableName: DYNAMODB_USER_TABLE,
        KeyConditionExpression: '#pk = :id and #sk = :family',
        ExpressionAttributeNames: {
          '#pk': 'ID',
          '#sk': 'FAMILY',
        },
        ExpressionAttributeValues: {
          ':id': userId,
          ':family': 'USER',
        },
      };

      const userData = await dynamo.query(params).promise();

      // Extract user data from returned query and identify if user was found in database
      if (userData.Items && userData.Count && userData.Count > 0) {
        return {
          success: true,
          statusCode: 200,
          message: "User found in the database",
          user: userData.Items[0],
        };
      } else {
        return {
          success: false,
          statusCode: 400,
          message: "User does not yet exist in the database",
        };
      }
    } catch (err) {
      console.log(err);
      return {
        success: false,
        statusCode: 500,
        message: "Error occurred while fetching user from database",
      };
    }
  }

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
  }
}

export default UserService;