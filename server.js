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
app.post('/login', async function(req, res) {
    console.log('Login request received')
    try {
      
        const TokenService = container.resolve('TokenService');
        
        var validEmails = ['ethan@fuelify.com']

        var userEmail = req.body.email
        var userPassword = req.body.password

        // Check if submitted email address matches an email in our allowed email list
        var response
        if (validEmails.includes(userEmail)) { // evaluate to true if in list
            //const response = await user.loginUser(userEmail,userPassword);
            if (userPassword == '123') {
                const tokens = await TokenService.createRefreshAndAccessToken(userEmail);
                response = {
                    statusCode: 200,
                    success: true,
                    token: tokens.accessToken,
                    message: "User successfully logged in",
                    data: {
                        access_token: tokens.accessToken,
                        email: userEmail,
                        id: 1,
                        refresh_token: tokens.refreshToken,
                        type: 'user'
                    }
                }
                console.log(response)
            } else {                
                response = {
                    statusCode: 402,
                    success: false,
                    message: "Password does not match user email record",
                }
            }
        } else { // email not in list
            response = {
                statusCode: 401,
                success: false,
                message: "Nonauthorize user email address",
                body: req
            }
        }

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