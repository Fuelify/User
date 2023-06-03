'strict'

// @ts-ignore
const pckjs = require('../package.json');

// @ts-ignore
import definitions from "./models/schemas/definitions.json";

export const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: "Fuelify User API",
      version: pckjs.version ? `${pckjs.version}` : '1.0.0', // TODO: Make this pckjs.version
      description:
        "User and Auth management. Sign-up, Sign-in, Sing-out. <br /> All handled errors will return a error json: <br /><br /> &nbsp;&nbsp; <b>{ success: false, message: 'error message' }</b>",
      contact: {
        name: "Fuelify Customer Service",
        email: "support@fuelifyyourlife.com",
      },
    },
    servers: [
      {
        url: "https://Fuelify-test.ourkollektiv.com",
        description: "Test server",
      },
      {
        url: "https://Fuelify-staging.ourkollektiv.com",
        description: "Staging server",
      },
      {
        url: "https://Fuelify.ourkollektiv.com/",
        description: "Production server",
      },
      {
        url: "http://127.0.0.1:3000",
        description: "Local Dev Server. Local running code.",
      },
    ],
    description: "Fuelify API documentation.",
    definitions,
    components: {
      schemas: {
        user: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "The users id.",
            },
            familyName: {
              type: "string",
              description: "The users family name / last name.",
            },
            givenName: {
              type: "string",
              description: "The users given name / first name.",
            },
            email: {
              type: "string",
              description: "The users email address.",
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*'],
};