class ConfigurationService  {

  AWS_CONFIG: string;
  FUELIFY_APP_ACCESS_SECRET: string;
  FUELIFY_APIKEY_SECRET: string;
  FUELIFY_APP_REFRESH_SECRET: string;
  FUELIFY_APP_ACCESSTOKEN_TIMEOUT: string;
  FUELIFY_APP_REFRESHTOKEN_TIMEOUT: string;
  FUELIFY_API_TOKEN: string;
  FUELIFY_API_TOKEN_TEST: string;
  FUELIFY_ADMIN_TOKEN: string;
  ENABLE_TEST_SITES: boolean;
  FUELIFY_USER_DYNAMODB_TABLENAME: string;
  FUELIFY_MEALPLAN_DYNAMODB_TABLENAME: string;
  SLACK_URL: string;
  EDAMAM_FOODAPI_ID: string;
  EDAMAM_FOODAPI_KEY: string;
  EDAMAM_RECIPEAPI_ID: string;
  EDAMAM_RECIPEAPI_KEY: string;
  EDAMAM_NUTRITIONAPI_ID: string;
  EDAMAM_NUTRITIONAPI_KEY: string;

  constructor({}) {

    const environment = process.env.ENVIRONMENT || 'STAGING';
    const tableEnvironment = capitalize(environment);

    this.AWS_CONFIG = process.env.AWS_CONFIG || '{"region": "us-east-2"}';

    this.FUELIFY_APP_ACCESS_SECRET = process.env.FUELIFY_APP_ACCESS_SECRET || '',
    this.FUELIFY_APIKEY_SECRET = process.env.FUELIFY_APIKEY_SECRET || '',
    this.FUELIFY_APP_REFRESH_SECRET = process.env.FUELIFY_APP_REFRESH_SECRET || '',
    this.FUELIFY_APP_ACCESSTOKEN_TIMEOUT = process.env.FUELIFY_APP_ACCESSTOKEN_TIMEOUT || '24h',
    this.FUELIFY_APP_REFRESHTOKEN_TIMEOUT = process.env.FUELIFY_APP_REFRESHTOKEN_TIMEOUT || '60d',
    this.FUELIFY_API_TOKEN = process.env.FUELIFY_API_TOKEN || '',
    this.FUELIFY_API_TOKEN_TEST = process.env.FUELIFY_API_TOKEN_TEST || '',
    this.FUELIFY_ADMIN_TOKEN = process.env.FUELIFY_ADMIN_TOKEN || '',

    this.ENABLE_TEST_SITES = process.env.ENABLE_TEST_SITES == 'true' || false,

    this.FUELIFY_USER_DYNAMODB_TABLENAME = tableEnvironment + '-' + (process.env.FUELIFY_USER_DYNAMODB_TABLENAME || 'User'),
    this.FUELIFY_MEALPLAN_DYNAMODB_TABLENAME = tableEnvironment + '-' + (process.env.FUELIFY_MEALPLAN_DYNAMODB_TABLENAME || 'Meals'),

    this.EDAMAM_FOODAPI_ID = process.env.EDAMAM_FOODAPI_ID || '',
    this.EDAMAM_FOODAPI_KEY = process.env.EDAMAM_FOODAPI_KEY || '',
    this.EDAMAM_RECIPEAPI_ID = process.env.EDAMAM_RECIPEAPI_ID || '',
    this.EDAMAM_RECIPEAPI_KEY = process.env.EDAMAM_RECIPEAPI_KEY || '',
    this.EDAMAM_NUTRITIONAPI_ID = process.env.EDAMAM_NUTRITIONAPI_ID || ''
    this.EDAMAM_NUTRITIONAPI_KEY = process.env.EDAMAM_NUTRITIONAPI_KEY || '',

    this.SLACK_URL = process.env.SLACK_URL || ''

  }
}

function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export default ConfigurationService
