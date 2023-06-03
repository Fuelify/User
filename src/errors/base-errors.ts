'use strict';

const apm = require('elastic-apm-node');

class ApplicationError extends Error {
    get name() {
        return this.constructor.name;
    }
};

class UserFacingError extends ApplicationError {
    
};

module.exports = function({ }){
    function userFacingError(statusCode: number, message: string | undefined, options = {}) {
        const error = new UserFacingError(message);
        //error.statusCode = statusCode;
        return error;
    }
    
    return {
        UserFacingError,
        userFacingError
    };
};