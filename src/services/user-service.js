// Load the AWS SDK for Node.js.
var AWS = require("aws-sdk");

// Set the AWS Credentials.
AWS.config.loadFromPath('./config.json')

// Create DynamoDB document client
var dynamoDB = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});


// Set DynamoDB table names and user api url
var stage = process.env.ENVIRONMENT;
if (stage) {
    // var USER_API = "https://user-"+stage.toLowerCase()+".ourkollektiv.com";
    // var USER_API = "http://localhost:3001";
    var DYNAMODB_USER_TABLE = stage+"-User";
} else { // default to staging environment
    // var USER_API = "https://user-staging.ourkollektiv.com";
    // var USER_API = "http://localhost:3001";
    var DYNAMODB_USER_TABLE = "Staging-User";
}


class UserService {

    // Register user in dynamodb database
    async registerUser(User) {
            
        try {
            var params = {
                TableName: DYNAMODB_USER_TABLE,
                Item: User
            };
            // Write plan data item to TrainingPlan table
            await dynamoDB.put(params).promise();
            
            return {
                success: true,
            }
        } catch(err) {
            console.log(err)
            return {
                success: false,
            }
        };

    }

    // Register user in dynamodb database
    async getUser(User) {
        
        try {
            var params = {
                TableName: DYNAMODB_USER_TABLE,
                KeyConditionExpression: '#pk = :id and #sk = :family',
                ExpressionAttributeNames:{
                    '#pk': 'ID',
                    '#sk': 'FAMILY',
                },
                ExpressionAttributeValues: {
                    ':id': User.email,
                    ':family': User.family,
                },
            };

            var userData = await dynamoDB.query(params).promise();
            
            // Extract user data from returned query and identify if user was found in database
            if (userData.Items && userData.Count > 0) {
                return {
                    success: true,
                    statusCode: 200,
                    message: "User found in the database",
                    user: userData.Items[0],
                } 
            } else {
                return {
                    success: false,
                    statusCode: 400,
                    message: "User does not yet exist in the database",
                } 
            }
            
        } catch(err) {

            console.log(err)
            return {
                success: false,
                statusCode: 500,
                message: "Error occurred while fetching user from database",
            } 

        };

    }

}

module.exports = UserService;