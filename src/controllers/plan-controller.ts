import { Router, Request, Response, NextFunction } from 'express';
// @ts-ignore
import { planService, requestErrors } from container.cradle;

interface Dependencies {
  planService: planService;
  requestErrors: requestErrors;
}

export default function ({ planService, requestErrors }: Dependencies) {
  async function getPlan(req: any, res: Response, next: NextFunction) {
    try {
      const result = await planService.getPlan(req.user, req.query.start, req.query.end);
      res.status(result.statusCode).send(result);
    } catch (err) {
      const message = 'Unhandled error at get creator details.';
      //logger.error(message + ' User: ' + (req.user === undefined ? '' : req.user.id));
      return next(requestErrors.internalServerError500(message));
    }
  }

  return {
    getPlan,
  };
};
