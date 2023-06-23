
import ResponseModel from '../models/response-model';
import UserModel from '../models/user-model';

import ConfigurationService from './configuration-service';
import LoggingService from './logging-service';

interface Dependencies {
  configurationService: ConfigurationService;
  loggingService: LoggingService;
}

class FoodService {
  configurationService: ConfigurationService;
  loggingService: LoggingService;

  constructor({ configurationService, loggingService }: Dependencies) {
    this.configurationService = configurationService;
    this.loggingService = loggingService;

  }

}

export default FoodService;
