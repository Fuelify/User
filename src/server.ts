import path from 'path'

// Setup elastic application monitoring
//@ts-ignore
/*import pckjs from '../package.json'
import { start as startAPM } from 'elastic-apm-node';
const apm = startAPM({
  serviceName: pckjs.name,
  centralConfig: false,
  contextPropagationOnly: true,
  captureExceptions: true,
  logUncaughtExceptions: true,
  metricsInterval: '0'
});*/

// Load environment variables. Needs to be loaded before other modules that need it!
import dotenv from 'dotenv';
dotenv.config();

// Initiate DI container setup
import { container, setup } from './dependency-constructor';
setup();

console.log('Modules loaded:', Object.keys(container.registrations));

// Import app
import app from './srcmod';
/*
import { Request, Response, NextFunction } from 'express';
app.use(function (err: { statusCode: any; message: string; }, req: Request, res: Response, next: NextFunction) {
  if (!(err instanceof container.cradle.baseErrors.UserFacingError)) {
    throw new container.cradle.baseErrors.UserFacingError('There was an unexpected error. Please provide the traceId for further investigation.', err);
    next();
  }

  res.status(err.statusCode || 500).send(createErrorResponse(err.message));
});
*/

//Setting up swagger for documentation
import swaggerJsonDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import {swaggerOptions} from "../src/swagger-specifications"
const swaggerDocs = swaggerJsonDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Listen on environment port or default to 3000
app.listen(process.env.PORT || 3000);
export default app;

function createErrorResponse(message: string) {
  return {
    success: false,
    message: message,
    //traceId: apm.currentTraceIds['trace.id']
  };
}