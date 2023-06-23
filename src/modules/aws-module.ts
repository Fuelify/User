import AWS from 'aws-sdk';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import ConfigurationService from '../services/configuration-service';
const configurationService: ConfigurationService = new ConfigurationService({});

AWS.config.update(JSON.parse(configurationService.AWS_CONFIG));

interface Dependencies {}

export interface AWSServices {
  dynamo: () => DynamoDBDocumentClient,
  dynamoBase: () => AWS.DynamoDB;
  s3: () => AWS.S3;
}

export default function ({ }: Dependencies): AWSServices {
  function dynamo(): DynamoDBDocumentClient {
    return DynamoDBDocumentClient.from(new DynamoDBClient(JSON.parse(configurationService.AWS_CONFIG)));
  }

  function dynamoBase(): AWS.DynamoDB {
    return new AWS.DynamoDB();
    //return new AWS.DynamoDB(process.env.AWS_DYNAMODB_CONFIG);
  }

  function s3(): AWS.S3 {
    return new AWS.S3();
    //return new AWS.S3(process.env.AWS_S3_CONFIG);
  }

  return {
    dynamo,
    dynamoBase,
    s3
  };
}
