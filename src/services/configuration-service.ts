interface EnvironmentConfig {
  ENVIRONMENT: string;
  FUELIFY_APP_SECRET: string | undefined;
  FUELIFY_APIKEY_SECRET: string | undefined;
  FUELIFY_APP_REFRESH_SECRET: string | undefined;
  FUELIFY_APP_ACCESSTOKEN_TIMEOUT: string | undefined;
  FUELIFY_APP_REFRESHTOKEN_TIMEOUT: string | undefined;
  FUELIFY_API_TOKEN: string | undefined;
  FUELIFY_API_TOKEN_TEST: string | undefined;
  FUELIFY_ADMIN_TOKEN: string | undefined;
  ENABLE_TEST_SITES: string | undefined;
  FUELIFY_USER_DYNAMODB_TABLENAME: string;
  FUELIFY_MEALPLAN_DYNAMODB_TABLENAME: string;
  EDAMAM_FOODAPI: string;
  EDAMAM_RECIPEAPI: string;
  EDAMAM_NUTRITIONAPI: string;
}

export default function (): EnvironmentConfig {
  const environment = process.env.ENVIRONMENT ? process.env.ENVIRONMENT : 'STAGING';
  const tableEnvironment = capitalize(environment);

  return {
    ENVIRONMENT: environment || '',

    FUELIFY_APP_SECRET: process.env.FUELIFY_APP_SECRET || undefined,
    FUELIFY_APIKEY_SECRET: process.env.FUELIFY_APIKEY_SECRET || undefined,
    FUELIFY_APP_REFRESH_SECRET: process.env.FUELIFY_APP_REFRESH_SECRET || undefined,
    FUELIFY_APP_ACCESSTOKEN_TIMEOUT: process.env.FUELIFY_APP_ACCESSTOKEN_TIMEOUT || undefined,
    FUELIFY_APP_REFRESHTOKEN_TIMEOUT: process.env.FUELIFY_APP_REFRESHTOKEN_TIMEOUT || undefined,
    FUELIFY_API_TOKEN: process.env.FUELIFY_API_TOKEN || undefined,
    FUELIFY_API_TOKEN_TEST: process.env.FUELIFY_API_TOKEN_TEST || undefined,
    FUELIFY_ADMIN_TOKEN: process.env.FUELIFY_ADMIN_TOKEN || undefined,

    ENABLE_TEST_SITES: process.env.ENABLE_TEST_SITES || undefined,

    FUELIFY_USER_DYNAMODB_TABLENAME: tableEnvironment + '-' + (process.env.FUELIFY_USER_DYNAMODB_TABLENAME || ''),
    FUELIFY_MEALPLAN_DYNAMODB_TABLENAME: tableEnvironment + '-' + (process.env.FUELIFY_MEALPLAN_DYNAMODB_TABLENAME || ''),

    EDAMAM_FOODAPI: process.env.EDAMAM_FOODAPI || '',
    EDAMAM_RECIPEAPI: process.env.EDAMAM_RECIPEAPI || '',
    EDAMAM_NUTRITIONAPI: process.env.EDAMAM_NUTRITIONAPI || '',
  };
}

function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
