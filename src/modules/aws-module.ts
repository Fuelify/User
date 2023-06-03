import AWS from 'aws-sdk';

AWS.config.update(JSON.parse(process.env.AWS_CONFIG || "{}"));

interface Dependencies {}

interface AWSServices {
  dynamo: () => AWS.DynamoDB.DocumentClient;
  dynamoBase: () => AWS.DynamoDB;
  s3: () => AWS.S3;
}

export default function ({ }: Dependencies): AWSServices {
  function dynamo(): AWS.DynamoDB.DocumentClient {
    return new AWS.DynamoDB.DocumentClient();
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
