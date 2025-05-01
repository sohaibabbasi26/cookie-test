const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Brainflow APIs documentation",
      version: "1.0.0",
      description: "Brainflow APIs descriptive documentation",
    },
    servers: [
      {
        url: "http://localhost:4000", 
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};


const swaggerSpec = swaggerJsdoc(swaggerOptions);


module.exports = {
    swaggerSpec
}