import swaggerJsdoc from 'swagger-jsdoc'

const PORT = process.env.PORT || 4000

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Appointment Booking API',
      version: '1.0.0',
      description:
        'API documentation for the Appointment Booking system, including user authentication, provider management, time slots, and appointment booking/cancellation.',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: 'Development Server',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'User authentication and registration',
      },
      {
        name: 'Slots',
        description: 'Provider time slot creation and lookup',
      },
      {
        name: 'Appointments',
        description: 'Appointment booking and cancellation',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme.',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier of the user',
            },
            name: { type: 'string', description: 'Full name of the user' },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
            },
            role: {
              type: 'string',
              enum: ['user', 'provider'],
              description: "Role of the user (either 'user' or 'provider')",
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date and time when the user was created',
            },
          },
          required: ['id', 'name', 'email', 'role'],
        },
        Provider: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier of the provider',
            },
            name: { type: 'string', description: 'Full name of the provider' },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the provider',
            },
            service: {
              type: 'string',
              description:
                "The service provided by the provider (e.g., 'Massage', 'Haircut')",
            },
          },
          required: ['id', 'name', 'email', 'service'],
        },
        SlotInput: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier of the time slot',
            },
            day: {
              type: 'string',
              format: 'date',
              description: 'The day for the time slot',
            },
            startTime: {
              type: 'string',
              example: '09:00',
              description: 'Start time of the time slot (in HH:MM format)',
            },
            endTime: {
              type: 'string',
              example: '10:00',
              description: 'End time of the time slot (in HH:MM format)',
            },
            serviceProviderId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the provider offering this time slot',
            },
            isAvailable: {
              type: 'boolean',
              description: 'Availability of the time slot (true if available)',
            },
          },
          required: ['id', 'day', 'startTime', 'endTime', 'serviceProviderId'],
        },
        SlotInput: {
          type: 'object',
          required: ['day', 'startTime', 'endTime', 'serviceId'],
          properties: {
            day: {
              type: 'string',
              format: 'date',
              example: '2025-05-20',
            },
            startTime: {
              type: 'string',
              format: 'time',
              example: '09:00',
            },
            endTime: {
              type: 'string',
              format: 'time',
              example: '09:30',
            },
            serviceId: {
              type: 'string',
              example: 'uuid-of-service',
            },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the appointment',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the user who booked the appointment',
            },
            providerId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the provider for the appointment',
            },
            serviceId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the service for the appointment',
            },
            timeslotId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the time slot selected for the appointment',
            },
            appointmentDate: {
              type: 'string',
              format: 'date',
              description: 'Date of the appointment',
            },
            appointmentTime: {
              type: 'string',
              example: '14:00',
              description: 'Time of the appointment (in HH:MM format)',
            },
            status: {
              type: 'string',
              enum: ['booked', 'cancelled'],
              description:
                "Status of the appointment (either 'booked' or 'cancelled')",
            },
          },
          required: [
            'id',
            'userId',
            'providerId',
            'serviceId',
            'timeslotId',
            'appointmentDate',
            'appointmentTime',
            'status',
          ],
        },
        AppointmentCreateInput: {
          type: 'object',
          properties: {
            timeslotId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the time slot to book',
            },
            appointment_date: {
              type: 'string',
              format: 'date',
              description: 'Date for the appointment',
            },
            appointment_time: {
              type: 'string',
              example: '14:00',
              description: 'Time for the appointment (in HH:MM format)',
            },
            serviceId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the service to be booked',
            },
          },
          required: ['timeslotId', 'appointment_date', 'appointment_time'],
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error message description' },
            errors: {
              type: 'array',
              items: { type: 'string' },
              example: ['"providerId" is not allowed'],
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
export default swaggerSpec
