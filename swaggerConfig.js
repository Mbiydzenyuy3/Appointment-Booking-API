import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Appointment Booking API",
      version: "1.0.0",
      description:
        "Comprehensive API documentation for an Appointment Booking system including user authentication, service providers, time slots, and appointment scheduling.",
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
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Provide your JWT token to authorize requests",
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
            createdAt: { type: "string", format: "date-time" },
          },
          required: ["id", "name", "email", "role"],
        },
        Provider: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            service: { type: "string" },
          },
          required: ["id", "name", "email"],
        },
        Slot: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            day: { type: "string", format: "date" },
            startTime: { type: "string", example: "09:00" },
            endTime: { type: "string", example: "10:00" },
            serviceProviderId: { type: "string", format: "uuid" },
            isAvailable: { type: "boolean" },
          },
          required: ["id", "day", "startTime", "endTime", "serviceProviderId"],
        },
        Appointment: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            providerId: { type: "string", format: "uuid" },
            slotId: { type: "string", format: "uuid" },
            appointmentDate: { type: "string", format: "date" },
            appointmentTime: { type: "string", example: "14:00" },
          },
          required: [
            "id",
            "providerId",
            "slotId",
            "appointmentDate",
            "appointmentTime",
          ],
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string", example: "Error message description" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"], // Paths to your route files with Swagger annotations
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
