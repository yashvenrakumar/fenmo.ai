const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Fenmo Expense Tracker API",
    version: "1.0.0",
    description: "Enterprise-style Expense Tracker API with idempotent writes.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development server",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, "..", "routes", "*.js")],
};

module.exports = swaggerJsDoc(options);
