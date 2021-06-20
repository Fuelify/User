
const { createContainer, asClass, asValue } = require('awilix');

// Repositories
//const UsersRepository = require('./repositories/user-repository');

// Services
const TokenService = require('./src/services/token-service');

// Models

const container = createContainer();

function setup() {
  
  container.register({
    //usersRepository: asClass(UsersRepository),
    
    tokenService: asClass(TokenService),
  });
}

module.exports = {
  container,
  setup
};