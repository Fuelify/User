const jwt = require('jsonwebtoken');

class TokenService {

    async createRefreshAndAccessToken(payload) {
        try {
            // Create tokens
            const accessToken = jwt.sign({payload}, process.env.APP_ACCESS_SECRET, {expiresIn: '360000ms'});
            const refreshToken = jwt.sign({payload}, process.env.APP_REFRESH_SECRET, {expiresIn: '60d'});

            // Update authorization repository


            // Return access and refresh tokens
            return {accessToken: accessToken, refreshToken: refreshToken}
        } catch(err) {
            console.log(err)
            return undefined
        }
    }

    async verifyAccessToken(accessToken) {
        try {
            return jwt.verify(accessToken, process.env.APP_ACCESS_SECRET)
        } catch(err) {
            console.log(err)
            return undefined
        }
    }

    async verifyRefreshToken(refreshToken) {
        try {
            return jwt.verify(refreshToken, process.env.APP_REFRESH_SECRET)
        } catch(err) {
            console.log(err)
            return undefined
        }
    }

}

module.exports = TokenService;