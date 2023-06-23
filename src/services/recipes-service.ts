
import ResponseModel from '../models/response-model';
import UserModel from '../models/user-model';

import ConfigurationService from './configuration-service';
import LoggingService from './logging-service';

interface Dependencies {
  configurationService: ConfigurationService;
  loggingService: LoggingService;
}

class RecipesService {
  configurationService: ConfigurationService;
  loggingService: LoggingService;

  constructor({ configurationService, loggingService }: Dependencies) {
    this.configurationService = configurationService;
    this.loggingService = loggingService;

  }


  async getRecipes(user: UserModel, search: string) {
    try {
      const recipes: object | undefined = [];

      return new ResponseModel(200,"success","Recipes fetched successfully",recipes);

    } catch (err) {
      this.loggingService.error('Retrieving user meal plan from database', err);
      throw err;
    }
  }

}

export default RecipesService;
