//swaggerConfig.js
import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Auth API", version: "1.0.0" },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;

// Quick Thunder Client test:
// POST http://localhost:5000/auth/register {"name":"A","email":"a@example.com","password":"pass"}
// POST http://localhost:5000/auth/login    {"email":"a@example.com","password":"pass"}
// Browse Swagger docs at http://localhost:3000/api-docs
