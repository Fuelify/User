/*import { Request, Response, NextFunction } from 'express';

var {container} = require('../dependency-constructor')

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenService = container.resolve('TokenService');
    const accessToken = req.header('Authorization');

    // Verify if access token provided is valid
    if (tokenService.verifyAccessToken(accessToken)) {
      next(); // allow request to proceed
    } else {
      res.status(401).send('User not valid!');
    }
  } catch (err) {
    console.log('authtoken error - access token expired');
    res.status(500).send('Authentication error - expired access token');
  }
};
*/