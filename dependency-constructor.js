
const { createContainer, asClass, asValue } = require('awilix');

// Repositories
//const UsersRepository = require('./repositories/user-repository');

// Services
const TokenService = require('./src/services/token-service');
const UserService = require('./src/services/user-service');

// Models

const container = createContainer();

function setup() {
  
  container.register({
    //usersRepository: asClass(UsersRepository),
    
    TokenService: asClass(TokenService),
    UserService: asClass(UserService),
  });
}

module.exports = {
  container,
  setup
};