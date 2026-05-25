const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const opciones = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'SISTRA-TEC API',
      version: '1.0.0',
      description: `
## Sistema de Trazabilidad de Donaciones

Backend del proyecto académico **IC-4810 Administración de Proyectos** del
Tecnológico de Costa Rica.

Permite rastrear en tiempo real el ciclo de vida completo de cada donación:
desde la recepción hasta la entrega final al beneficiario.

### Ciclo de vida de una donación
\`RECIBIDO → CLASIFICADO → EN_TRANSITO → ENTREGADO\`

Las transiciones son **secuenciales y unidireccionales**. Una donación
en estado \`ENTREGADO\` queda bloqueada permanentemente.

### Roles del sistema
| Rol (DB)      | Descripción                          |
|---------------|--------------------------------------|
| \`donor\`       | Donante — registra y consulta sus donaciones |
| \`transporter\` | Transportista — gestiona envíos asignados    |
| \`admin\`       | Administrador del centro de acopio           |

### Autenticación
Todos los endpoints protegidos requieren un **Bearer Token JWT** en el header \`Authorization\`.
Los tokens se obtienen en \`POST /auth/login\` y se renuevan en \`POST /auth/refresh\`.
      `,
      contact: {
        name: 'Equipo SISTRA-TEC — IC-4810 TEC',
        email: 'arielsanchez2110@gmail.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Desarrollo local',
      },
      {
        url: 'https://sistratec-api.example.com/api/v1',
        description: 'Producción (reemplazar con URL real)',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token JWT obtenido en POST /auth/login',
        },
      },
      schemas: {
        // ----------------------------------------------------------------
        // Enums
        // ----------------------------------------------------------------
        EstadoDonacionEnum: {
          type: 'string',
          enum: ['recibido', 'clasificado', 'en_transito', 'entregado'],
          description: 'Estado del ciclo de vida de la donación. Solo avanza, nunca retrocede.',
          example: 'recibido',
        },
        RolEnum: {
          type: 'string',
          enum: ['donor', 'transporter', 'admin'],
          description: 'Rol del usuario en el sistema.',
          example: 'donor',
        },

        // ----------------------------------------------------------------
        // Respuestas estándar
        // ----------------------------------------------------------------
        RespuestaExito: {
          type: 'object',
          description: 'Respuesta estándar de éxito del API',
          required: ['exito', 'mensaje', 'datos', 'error'],
          properties: {
            exito: {
              type: 'boolean',
              example: true,
            },
            mensaje: {
              type: 'string',
              description: 'Descripción legible del resultado',
              example: 'Operación completada exitosamente',
            },
            datos: {
              description: 'Payload de la respuesta. Puede ser objeto, array o null.',
              nullable: true,
              example: {},
            },
            error: {
              type: 'object',
              nullable: true,
              example: null,
            },
          },
        },
        RespuestaError: {
          type: 'object',
          description: 'Respuesta estándar de error del API',
          required: ['exito', 'mensaje', 'datos', 'error'],
          properties: {
            exito: {
              type: 'boolean',
              example: false,
            },
            mensaje: {
              type: 'string',
              description: 'Descripción legible del error',
              example: 'No se pudo completar la operación',
            },
            datos: {
              nullable: true,
              example: null,
            },
            error: {
              type: 'object',
              nullable: true,
              required: ['codigo'],
              properties: {
                codigo: {
                  type: 'string',
                  description: 'Código de error para consumo programático',
                  example: 'RECURSO_NO_ENCONTRADO',
                },
                detalle: {
                  type: 'string',
                  nullable: true,
                  description: 'Información extra (solo visible en development)',
                  example: null,
                },
              },
            },
          },
        },

        // ----------------------------------------------------------------
        // Entidades de dominio
        // ----------------------------------------------------------------
        Usuario: {
          type: 'object',
          description: 'Información pública de un usuario. Nunca incluye passwordHash.',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            },
            fullName: {
              type: 'string',
              maxLength: 150,
              example: 'María Fernández Solís',
            },
            email: {
              type: 'string',
              format: 'email',
              maxLength: 150,
              example: 'maria.fernandez@example.com',
            },
            role: {
              $ref: '#/components/schemas/RolEnum',
            },
            address: {
              type: 'string',
              example: 'San José, Costa Rica, 100m norte del parque central',
            },
            phone: {
              type: 'string',
              nullable: true,
              maxLength: 20,
              example: '+506 8888-1234',
            },
            vehicle: {
              type: 'string',
              nullable: true,
              maxLength: 150,
              description: 'Solo aplica a transportistas',
              example: 'Toyota Hilux blanca, placa CRC-1234',
            },
            collectionCenterId: {
              type: 'integer',
              nullable: true,
              description: 'Solo aplica a admins y transportistas',
              example: 2,
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-05-25T17:00:00.000Z',
            },
          },
        },

        Donacion: {
          type: 'object',
          description: 'Representación completa de una donación en el sistema.',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'f0e1d2c3-b4a5-6789-0abc-def123456789',
            },
            donorId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del usuario donante',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            },
            donationTypeId: {
              type: 'integer',
              description: 'ID del tipo de bien donado (referencia a donation_types)',
              example: 1,
            },
            collectionCenterId: {
              type: 'integer',
              description: 'ID del centro de acopio destino',
              example: 2,
            },
            trackingId: {
              type: 'string',
              maxLength: 20,
              description: 'Código público de seguimiento. Formato: DON-AAAA-XXXX',
              example: 'DON-2026-A4F9',
            },
            descripcion: {
              type: 'string',
              description: 'Descripción detallada de los bienes donados',
              example: '3 cajas de arroz, 2 latas de atún y 5 paquetes de frijoles',
            },
            pickupAddress: {
              type: 'string',
              nullable: true,
              description: 'Dirección de recogida si la donación no se entrega en el centro',
              example: 'Cartago, Residencial Los Pinos, casa #5',
            },
            estimatedDeliveryDate: {
              type: 'string',
              format: 'date',
              description: 'Fecha estimada de entrega al beneficiario',
              example: '2026-06-15',
            },
            deliveredAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Fecha y hora real de entrega. Solo presente en estado entregado.',
              example: null,
            },
            status: {
              $ref: '#/components/schemas/EstadoDonacionEnum',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-05-25T17:00:00.000Z',
            },
          },
        },

        TrackingEvent: {
          type: 'object',
          description: 'Evento de cambio de estado en la bitácora de trazabilidad.',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
            },
            donationId: {
              type: 'string',
              format: 'uuid',
              example: 'f0e1d2c3-b4a5-6789-0abc-def123456789',
            },
            changedBy: {
              type: 'string',
              format: 'uuid',
              description: 'ID del usuario que realizó el cambio',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            },
            fromStatus: {
              $ref: '#/components/schemas/EstadoDonacionEnum',
              nullable: true,
              description: 'Estado anterior (null en la creación inicial)',
            },
            toStatus: {
              $ref: '#/components/schemas/EstadoDonacionEnum',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-05-25T18:30:00.000Z',
            },
          },
        },

        DonacionAsignacion: {
          type: 'object',
          description: 'Asignación de una donación clasificada a un transportista.',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'b2c3d4e5-f6a7-8901-bcde-f01234567890',
            },
            donationId: {
              type: 'string',
              format: 'uuid',
            },
            transporterId: {
              type: 'string',
              format: 'uuid',
            },
            vehicleDescription: {
              type: 'string',
              example: 'Toyota Hilux blanca, placa CRC-1234',
            },
            destination: {
              type: 'string',
              example: 'Albergue Municipal de Cartago, contiguo al estadio',
            },
            assignedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-05-26T09:00:00.000Z',
            },
          },
        },

        CentroAcopio: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            nombre: {
              type: 'string',
              maxLength: 150,
              example: 'Cruz Roja Cartago',
            },
            direccion: {
              type: 'string',
              example: 'Cartago Centro, frente al Parque Central',
            },
          },
        },

        TipoDonacion: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            nombre: {
              type: 'string',
              maxLength: 100,
              example: 'Alimentos no perecederos',
            },
          },
        },
      },

      // Respuestas reutilizables
      responses: {
        NoAutenticado: {
          description: 'Token ausente o inválido',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RespuestaError' },
              example: {
                exito: false,
                mensaje: 'Token de autenticación inválido o expirado',
                datos: null,
                error: { codigo: 'TOKEN_INVALIDO', detalle: null },
              },
            },
          },
        },
        Prohibido: {
          description: 'El usuario no tiene el rol requerido para esta acción',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RespuestaError' },
              example: {
                exito: false,
                mensaje: 'No tiene permisos para acceder a este recurso',
                datos: null,
                error: { codigo: 'ACCESO_DENEGADO', detalle: 'Roles permitidos: admin' },
              },
            },
          },
        },
        NoEncontrado: {
          description: 'El recurso solicitado no existe',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RespuestaError' },
              example: {
                exito: false,
                mensaje: 'Recurso no encontrado',
                datos: null,
                error: { codigo: 'RECURSO_NO_ENCONTRADO', detalle: null },
              },
            },
          },
        },
        ErrorServidor: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RespuestaError' },
              example: {
                exito: false,
                mensaje: 'Error interno del servidor',
                datos: null,
                error: { codigo: 'ERROR_INTERNO', detalle: null },
              },
            },
          },
        },
        ErrorValidacion: {
          description: 'El cuerpo de la solicitud contiene datos inválidos',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RespuestaError' },
              example: {
                exito: false,
                mensaje: 'Datos de entrada inválidos',
                datos: null,
                error: { codigo: 'VALIDACION_FALLIDA', detalle: 'email debe ser un correo válido' },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Público', description: 'Endpoints sin autenticación' },
      { name: 'Donante', description: 'Endpoints exclusivos para el rol `donor`' },
      { name: 'Administrador', description: 'Endpoints exclusivos para el rol `admin`' },
      { name: 'Transportista', description: 'Endpoints exclusivos para el rol `transporter`' },
    ],
  },
  // Rutas donde swagger-jsdoc buscará anotaciones @swagger
  apis: [
    path.join(__dirname, '../interfaces/http/routes/*.js').replace(/\\/g, '/'),
    path.join(__dirname, '../interfaces/http/controllers/*.js').replace(/\\/g, '/'),
  ],
};

const especificacion = swaggerJsdoc(opciones);

module.exports = especificacion;
