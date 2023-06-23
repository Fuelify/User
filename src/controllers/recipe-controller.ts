import { Router, Request, Response, NextFunction } from 'express';
import UserModel from '../models/user-model';
// @ts-ignore
import { recipeService, requestErrors } from container.cradle;

interface Dependencies {
  recipeService: recipeService;
  requestErrors: requestErrors;
}

export default function ({ recipeService, requestErrors }: Dependencies) {
  async function getRecipes(req: any, res: Response, next: NextFunction) {
    try {
      const response = await recipeService.getRecipes(req.user, req.query.search);
      res.status(response.statusCode).send(response);
    } catch (err) {
      const message = 'Unhandled error at get recipes.';
      return next(requestErrors.internalServerError500(message));
    }
  }

  async function getSimilarRecipes(req: any, res: Response, next: NextFunction) {
    try {
      const response = await recipeService.getRecipes(req.user, req.query.id);
      res.status(response.statusCode).send(response);
    } catch (err) {
      const message = 'Unhandled error at get similar recipes.';
      return next(requestErrors.internalServerError500(message));
    }
  }

  return {
    getRecipes,
    getSimilarRecipes
  };
};
