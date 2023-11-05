import { Router } from 'express';
import { container } from '../dependency-constructor';
//import { verifyApiToken, verifyToken } from container.cradle.authorization;
//import { requestErrors } from container.cradle;
// @ts-ignore
const requestErrors = container.cradle.requestErrors;
const userController  = container.cradle.userController;
const { verifyApiToken, verifyAccessToken } = container.cradle.authorization

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
router.post('/login', verifyApiToken, userController.loginUser);

/**
 * @swagger
 * /api/v1/user/create:
 *  post:
 *      summary: Create user.
 *      description: Create user with custom username (email) and password.
 *      parameters:
 *        - in: header
 *          name: Api-Key
 *          schema:
 *            type: string
 *      requestBody:
 *          description: Expect email, password, family, and provider as input
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
 *                        family:
 *                          type: string
 *                          description: The user family group as specified during signup and by app.
 *                          default: 'USER'
 *                        provider:
 *                          type: string
 *                          description: The login provider type as specified during signup and by app
 *                          default: 'FUELIFY'
 *      responses:
 *          '200':
 *              description: Returns a successful user creation.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                            statusCode:
 *                              type: integer
 *                              description: The status code of the response
 *                            status:
 *                              type: string
 *                              description: Status of the request
 *                            message:
 *                              type: string
 *                              description: Message indicating success creating user.
 *      tags:
 *      - user
 */
router.post('/create', verifyApiToken, userController.createUser);

router.get('/', verifyApiToken, verifyAccessToken, userController.getUser);

router.delete('/', verifyApiToken, verifyAccessToken, userController.deleteUser);

router.post('/logout', verifyApiToken, verifyAccessToken, userController.logoutUser);

router.post('/refresh-tokens', verifyApiToken, userController.refreshTokens);

router.post('/password/change', verifyApiToken, verifyAccessToken, userController.changePassword);

router.post('/password/reset', verifyApiToken, userController.resetPassword);

router.post('/password/reset-email', verifyApiToken, userController.sendPasswordResetEmail);



export default router;