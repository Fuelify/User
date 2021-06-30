var express = require('express');
const { v4: uuidv4 } = require('uuid');

process.env.APP_ACCESS_SECRET = 'asdhjahsd77123';
process.env.APP_REFRESH_SECRET = 'kajdjahfds';

var {setup, container} = require('./dependency-constructor');
setup();

var app = express();
var router = express.Router();

const verifytoken = require('./src/middleware/verify-token');

var path = require('path');
var publicDir = path.join(__dirname,'public');

app.use(express.static(publicDir))
app.use(express.json());


app.get('/', function(req, res) {
  res.send({
    "Output": "Hello World!"
  });
});

app.post('/', function(req, res) {
  res.send({
    "Output": "Hello World!"
  });
});

// Login user in system, return token
app.post('/user/login', async function(req, res) {
    console.log('Login request received')
    try {
        // NEW THE FOLLOWING TO BE IN REQUEST BODY
        // - Email
        // - Password
        // - Group
        // - Provider
        /* VERIFY BELOW FIELDS ARE PRESENT
        var userInputs = {
            'email': req.body.email,
            'password': req.body.password,
            'group': req.body.group,
            'provider': req.body.provider,
        }
        */
      
        const TokenService = container.resolve('TokenService');
        const UserService = container.resolve('UserService');
        
        resp = await UserService.getUser(req.body)
        console.log(resp)
        // Check if the user was successfully fetched from database
        var response;
        if (resp.success) {
            var User = resp.user;
            var email = req.body.email;
            var provider = req.body.provider;
            var password = req.body.password;
            // Validate passwords match either the users provider password or the admin provider password
            if (password == User.Passwords[provider] || password == User.Passwords['ADMIN']) {
                // Check if validation was true against the admin password
                if (password == User.Passwords['ADMIN']) {
                    var family = 'ADMIN';
                } else {
                    var family = 'USER';
                };
                const tokens = await TokenService.createRefreshAndAccessToken(email);
                response = {
                    statusCode: 200,
                    success: true,
                    token: tokens.accessToken,
                    message: "User successfully logged in",
                    data: {
                        access_token: tokens.accessToken,
                        email: email,
                        id: email,
                        refresh_token: tokens.refreshToken,
                        type: family
                    }
                }
                console.log(response)
            } else {                
                response = {
                    statusCode: 401,
                    success: false,
                    message: "Password does not match user email record",
                }
            }

        } else {
            response = resp;
        }

        res.status(response.statusCode).send(response)

    } catch(err) {
        res.status(500).send(err)
    }

});

// Register user in system, return token
app.post('/user/register', async function(req, res) {
    console.log('Register request received')

    // INCOMING SHOULD CONTAIN THE FOLLOWING
    //  - Email
    //  - Group [USER, SUPPORT, DEVELOPER, ADMIN, NUTRITIONIST], THE APP WILL ALWAYS SEND BACK A USER GROUP
    //  - Provider [FUELIFY, GOOGLE, APPLE, FACEBOOK, ADMIN]

    try {

        // TODO Check if user is already registered in system
        
        userInputs = req.body;

        var User = {
            ID: userInputs.email,
            FAMILY: userInputs.family,
            Passwords: {},
            DeviceTokens: {},
            RefreshToken: "",
            Salt: "",
            Settings: {},
            Plan: userInputs.plan ? userInputs.plan : "Free",
            State: "Registered",
        }

        // Set provider password #TODO ENCRYPT PASSWORD
        User.Passwords[userInputs.provider] = userInputs.password

        // Create an admin password for user
        if (userInputs.provider !== 'ADMIN'){
            User.Passwords['ADMIN'] = 'AdminPassword2*' // TODO ENCRYPT PASSWORD 
        }

        // Generate user authorization token
        const TokenService = container.resolve('TokenService');
        const tokens = await TokenService.createRefreshAndAccessToken(userInputs.email);

        var response = {
            statusCode: 200,
            success: true,
            token: tokens.accessToken,
            message: "User successfully registered in system",
            data: {
                access_token: tokens.accessToken,
                email: userInputs.email,
                id: userInputs.email,
                refresh_token: tokens.refreshToken,
                type: userInputs.group,
            }
        }

        // Register user in database
        const UserService = container.resolve('UserService');
        resp = await UserService.registerUser(User);

        res.status(response.statusCode).send(response)

    } catch(err) {
        res.status(500).send(err)
    }

});


// Fetch foods endpoint
app.get('/foods/fetch', verifytoken, function(req, res) {
    
    // Access the provided 'page' and 'limt' query parameters
    let limit = req.query.limit;

    var foods = [
        {
            name: 'Lauren Turner',
            designation: 'Content Writer',
            userFavorites: 4,
            bio:
                'Psychology, science, and art are what helps me to learn the outside world and myself.',
            age: 24,
            imgUrl: 'assets/Food1.jpg',
            location: 'North London'
        },
        {
            name: 'Lori Perez',
            designation: 'UI Designer ',
            userFavorites: 8,
            bio:
                'Travelling, adventures, extreme sports are also an integral part of me, but I like watching and admiring extreme sports rather than doing it ?',
            location: 'Leeds',
            age: 26,
            imgUrl: 'assets/Food2.jpg',
        },
        {
            name: 'Christine Wallace',
            designation: 'News Reporter',
            userFavorites: 2,
            bio:
                'Psychology, science, and art are what helps me to learn the outside world and myself.',
            location: 'Liverpool',
            age: 23,
            imgUrl: 'assets/Food3.jpg',
        },
        {
            name: 'Rachel Green',
            designation: 'Architect',
            userFavorites: 8,
            bio:
                'Psychology, science, and art are what helps me to learn the outside world and myself.',
            location: 'Nottingham',
            age: 22,
            imgUrl: 'assets/Food4.jpg',
        },
        {
            name: 'Emma',
            designation: 'Software Developer',
            userFavorites: 3,
            bio:
                'Psychology, science, and art are what helps me to learn the outside world and myself.',
            location: 'Manchester',
            age: 25,
            imgUrl: 'assets/Food5.jpg',
        },
        {
            name: 'Kim Wexler',
            designation: 'Accountant',
            userFavorites: 5,
            bio:
                'Psychology, science, and art are what helps me to learn the outside world and myself.',
            location: 'Birmingham',
            age: 30,
            imgUrl: 'assets/Food6.jpg',
        },
    ]

    // Retrive another n
    res.status(200).send({"message": "Returning another "+limit.toString()+" food items.", "foods": foods });
});




app.get('/tokentest', verifytoken, function(req, res) {
    res.send({"Output": "Token verified" });
});

var port = process.env.PORT || 3000;
app.listen(port);
module.exports = app;