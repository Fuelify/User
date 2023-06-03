import { Router, Request, Response, NextFunction } from 'express';
const pckjs = require('../../package.json');

import { container } from '../dependency-constructor';
//const aws = container.cradle.awsModule;

import AWSServices from '../modules/aws-module'
const awsServices = AWSServices({});
const dynamoBase = awsServices.dynamoBase();

const configurationService = container.cradle.configurationService;

const router = Router();

router.get('/health', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = { TableName: configurationService.FUELIFY_USER_DYNAMODB_TABLENAME };
    const tableDescription = await dynamoBase.describeTable(params).promise();
    //@ts-ignore
    const tableStatus = tableDescription['Table']['TableStatus'];

    res.status(200).json({
      version: pckjs.version,
      name: 'user.api.fuelify',
      uptime: process.uptime(),
      environment: configurationService.ENVIRONMENT,
      tablename: params.TableName,
      tablestatus: tableStatus
    });
  } catch (error) {
    next(error);
  }
});

export default router;
