import { Router } from 'express';
import { container } from '../dependency-constructor';
//import { verifyApiToken, verifyToken } from container.cradle.authorization;
//import { requestErrors } from container.cradle;
// @ts-ignore
const requestErrors = container.cradle.requestErrors;
const userController  = container.cradle.userController;
const { verifyApiToken } = container.cradle.authorization

const router = Router();
/**
 * @swagger
 * /api/v1/user/login:
 *  post:
 *      summary: Login user.
 *      description: Login a kollektiv user with custom username (email) and password.
 *      parameters:
 *        - in: header
 *          name: Api-Key
 *          schema:
 *            type: string
 *      requestBody:
 *          description: Expect email and password as input.
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      description: The value for the hasCompletedOnboarding attribute.
 *                      properties:
 *                        email:
 *                          type: string
 *                          description: The email the user used to sign up with.
 *                        password:
 *                          type: string
 *                          description: The password the user created during sign up.
 *      responses:
 *          '200':
 *              description: Returns a AccessToken and a Refreshtoken. The Refreshtoken can be used once.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                            accesstoken:
 *                              type: string
 *                              description: The token used to authenticate the user in the API.
 *                            refreshtoken:
 *                              type: string
 *                              description: The token used to get a new accesstoken when the accesstoken expires. The refreshtoken is a one time use.
 *                            accesstokenExp:
 *                              type: integer
 *                              description: The expiration of the accesstoken
 *                            refreshtokenExp:
 *                              type: integer
 *                              description: The expiration of the refreshtoken
 *          '400':
 *              description: Unable to retrieve access tokens. Error message is returned in the body.
 *          '401':
 *              description: Invalid username or password.
 *          '500':
 *              description: Unhandled error. No one know what happend here!
 *      tags:
 *      - user
 */
router.post('/login', verifyApiToken, userController.login);
//router.post('/login', verifyApiToken, userController.login);

export default router;