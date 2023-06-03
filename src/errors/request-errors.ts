'use strict';

//@ts-ignore
module.exports = function({ baseErrors }){
    function badRequest400(message: string, options = {}) {
        return baseErrors.userFacingError(400, message, options);
    }
    
    function unauthorized401(message: string, options = {}) {
        return baseErrors.userFacingError(401, message, options);
    }
        
    function forbidden403(message: string, options = {}) {
        return baseErrors.userFacingError(403, message, options);
    }
    
    function notFound404(message: string, options = {}) {
        return baseErrors.userFacingError(404, message, options);
    }
    
    function internalServerError500(message: string, options = {}) {
        return baseErrors.userFacingError(500, message, options);
    }
    
    return {
        badRequest400,
        unauthorized401,
        forbidden403,
        notFound404,
        internalServerError500
    };
};