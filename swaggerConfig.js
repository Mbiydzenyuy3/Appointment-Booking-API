// swaggerConfig.js
import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Appointment Booking API",
      version: "1.0.0",
      description:
        "API documentation for an Appointment Booking system with authentication, service providers, time slots, and booking appointments.",
      contact: {
        name: "API Support",
        email: "support@example.com", 
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}/api`,
        description: "Development Server",
      },
      // You can later add staging/production servers here.
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["user", "provider"] },
            created_at: { type: "string", format: "date-time" },
          },
          required: ["id", "name", "email", "role"],
        },
        Provider: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            service: { type: "string" },
            user_id: { type: "string", format: "uuid" },
          },
          required: ["id", "service", "user_id"],
        },
        Slot: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            day: { type: "string", format: "date" },
            start_time: { type: "string", format: "time" },
            end_time: { type: "string", format: "time" },
            service_provider_id: { type: "string", format: "uuid" },
            is_available: { type: "boolean" },
          },
          required: [
            "id",
            "day",
            "start_time",
            "end_time",
            "service_provider_id",
          ],
        },
        Appointment: {
          type: "object",
          properties: {
            client_id: { type: "string", format: "uuid" },
            service_provider_id: { type: "string", format: "uuid" },
          },
          required: ["client_id", "service_provider_id"],
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Route files where we can add endpoint documentation
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
