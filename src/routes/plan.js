import { Router } from 'express';
import { container } from '../dependency-constructor';

//import { verifyApiToken, verifyToken } from container.cradle.authorization;
//import { requestErrors } from container.cradle;

// @ts-ignore
const requestErrors = container.cradle.requestErrors;
const planController  = container.cradle.planController;
const {verifyAccessToken}  = container.cradle.authorization;

const router = Router();

/**
 * /api/v1/plan:
 *  get:
 *      summary: Get meal plan.
 *      description: Get a users meal plan between two dates.
 * */
router.get('/', verifyAccessToken, planController.getPlan);

export default router;