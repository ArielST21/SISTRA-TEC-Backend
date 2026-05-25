# SISTRA-TEC Backend

Backend del **Sistema de Trazabilidad de Donaciones** desarrollado como proyecto del curso **IC-4810 Administración de Proyectos** del Tecnológico de Costa Rica.

## Propósito

Tras emergencias naturales en Costa Rica, los donantes desconfían del destino de sus aportes. SISTRA-TEC es una plataforma web que permite rastrear en tiempo real el ciclo de vida completo de cada donación, desde la recepción hasta la entrega final al beneficiario.

---

## Stack tecnológico

| Capa            | Tecnología                                |
|-----------------|-------------------------------------------|
| Runtime         | Node.js >= 18                             |
| Framework HTTP  | Express 4                                 |
| Base de datos   | PostgreSQL alojado en Neon                |
| Cliente SQL     | `pg` (driver oficial, queries parametrizadas) |
| Autenticación   | JWT (access + refresh). OAuth2 pendiente. |
| Hashing         | bcrypt                                    |
| Seguridad HTTP  | helmet, cors, express-rate-limit          |
| Validación      | express-validator                         |
| Logging         | morgan                                    |
| Tests           | Jest + Supertest (cobertura mínima 70%)   |

---

## Arquitectura — Clean Architecture

La separación de capas es **estricta**. Una capa interior nunca conoce a una capa exterior.

```
src/
├── domain/              ← Núcleo. Entidades, reglas y contratos. Sin dependencias externas.
│   ├── entities/        ← Donacion, Usuario, EstadoDonacion, RolUsuario
│   ├── repositories/    ← Interfaces (contratos) que la infraestructura debe implementar
│   └── services/        ← Servicios puros de dominio (ej: generador de tracking-id)
│
├── application/         ← Casos de uso. Orquestan entidades y repositorios.
│   └── use-cases/       ← Un archivo por caso de uso (registrar-donacion.js, etc.)
│
├── infrastructure/      ← Implementaciones concretas. Aquí vive lo "sucio".
│   ├── database/
│   │   ├── connection.js          ← Pool de conexión a Neon
│   │   └── repositories/          ← Implementaciones Pg de los contratos de domain/
│   └── auth/
│       ├── jwt-service.js         ← Firma y verificación de tokens
│       └── password-service.js    ← Hash y verificación de contraseñas con bcrypt
│
├── interfaces/          ← Adaptadores de entrada (HTTP)
│   ├── http/
│   │   ├── controllers/           ← Reciben req, llaman al caso de uso, devuelven res
│   │   ├── middlewares/           ← auth, roles, errores, rate-limit
│   │   ├── routes/                ← Routers de Express
│   │   └── utils/                 ← Helpers de respuesta estándar
│   └── validators/                ← Reglas de express-validator
│
└── config/
    └── env.js           ← Carga .env.{development|production|test} según NODE_ENV
```

### Reglas inviolables

- `domain/` **no** importa de `application/`, `infrastructure/` ni `interfaces/`.
- `application/` **no** importa de `infrastructure/` ni `interfaces/`. Solo de `domain/`.
- `interfaces/http/controllers/` **no** contienen SQL ni lógica de negocio. Solo delegan a casos de uso.
- `infrastructure/database/` es el **único** lugar donde se escribe SQL.

---

## Estructura de carpetas — descripción

| Carpeta                          | Responsabilidad                                              |
|----------------------------------|--------------------------------------------------------------|
| `src/domain/entities/`           | Modelos de negocio puros (POJO + reglas de invariantes)       |
| `src/domain/repositories/`       | Contratos (clases abstractas) que las implementaciones extienden |
| `src/domain/services/`           | Funciones puras del dominio (sin I/O)                         |
| `src/application/use-cases/`     | Un caso de uso por archivo. Recibe repos por inyección.       |
| `src/infrastructure/database/`   | Pool de Postgres, queries SQL y mappers `fila ↔ entidad`      |
| `src/infrastructure/auth/`       | JWT, bcrypt y futuros proveedores OAuth2                      |
| `src/interfaces/http/`           | Express: rutas, controllers, middlewares                      |
| `src/interfaces/validators/`     | Validación de payloads HTTP (express-validator)               |
| `src/config/`                    | Carga de configuración tipada                                 |
| `__tests__/`                     | Espejo de `src/`. Cobertura mínima del 70% en lógica de negocio. |

---

## Modelo de datos (Neon)

> **Fuente de verdad.** No modificar el schema sin migración explícita.

### ENUMs

```
donation_status: recibido → clasificado → en_transito → entregado
user_role:       donor | transporter | admin
```

### Tablas

| Tabla                  | Columnas clave                                                                                          | Notas                                              |
|------------------------|---------------------------------------------------------------------------------------------------------|----------------------------------------------------|
| `collection_centers`   | `id` (int PK), `nombre` (UNIQUE, 150), `direccion` (text)                                               | Pre-cargada con 10 centros (Cruz Roja, etc.)       |
| `donation_types`       | `id` (int PK), `nombre` (UNIQUE, 100)                                                                   | Pre-cargada con 10 tipos                            |
| `users`                | `id` (uuid PK), `full_name`, `email` (UNIQUE), `password_hash`, `role` (enum), `address`, `phone`, `vehicle`, `collection_center_id` (FK), `is_active`, `created_at` | `vehicle` aplica a transportistas. `collection_center_id` aplica a admins y transportistas. |
| `donations`            | `id` (uuid PK), `donor_id` (FK users), `donation_type_id` (FK), `collection_center_id` (FK), `tracking_id` (UNIQUE, varchar 20), `descripcion`, `pickup_address`, `estimated_delivery_date`, `delivered_at`, `status` (enum, default 'recibido'), `created_at` | `tracking_id` es el código público (ej: `DON-2026-A4F9`). |
| `donation_assignments` | `id` (uuid PK), `donation_id` (FK), `transporter_id` (FK users), `vehicle_description`, `destination`, `assigned_at` | Una donación clasificada se asigna a un transportista. |
| `tracking_events`      | `id` (uuid PK), `donation_id` (FK), `changed_by` (FK users), `from_status`, `to_status`, `created_at` | Bitácora inmutable. Toda transición debe registrarse. |

### Relaciones

```
users (donor)         1 ── N  donations
users (transporter)   1 ── N  donation_assignments
users (admin/transp.) N ── 1  collection_centers (opcional)
donations             1 ── 1  donation_assignments  (cuando es clasificada)
donations             1 ── N  tracking_events
donation_types        1 ── N  donations
collection_centers    1 ── N  donations
```

---

## Ciclo de vida de la donación

```
[RECIBIDO] ──► [CLASIFICADO] ──► [EN_TRANSITO] ──► [ENTREGADO]
```

### Reglas inviolables del dominio

1. **Avance secuencial estricto.** Solo se puede pasar al siguiente estado. Nunca retroceder.
2. **No saltos.** No se puede ir de `recibido` directo a `en_transito`, etc.
3. **`entregado` es terminal.** Una vez entregada, la donación queda **bloqueada** para cualquier modificación.
4. **Cancelación restringida.** El donante solo puede cancelar mientras esté en `recibido`.
5. **Bitácora obligatoria.** Toda transición de estado **debe** registrar un `tracking_events`.
6. **Asignación previa al tránsito.** Para que un transportista marque una donación como `en_transito`, debe existir un `donation_assignments` para él.

Estas reglas están implementadas en `src/domain/entities/estado-donacion.js` y deben validarse en los casos de uso, **no en los controllers**.

---

## Roles del sistema

| Rol enum DB    | Permisos principales                                                                              |
|----------------|----------------------------------------------------------------------------------------------------|
| `donor`        | Registra donaciones · consulta por `tracking_id` · cancela mientras esté en `recibido`            |
| `transporter`  | Ve sus asignaciones · marca lotes como `en_transito` · confirma entrega (`entregado`)             |
| `admin`        | Cambia `recibido → clasificado` · asigna transportistas · alta/baja de transportistas · dashboard de métricas |

> **Nota:** se usa el ENUM nativo de la DB (`donor`/`transporter`/`admin`) sin traducción. Está expuesto así en JWT y en respuestas JSON.

---

## Endpoints planeados (por rol)

> Estado actual: solo `GET /api/v1/health` está implementado. El resto se irá agregando.

### Públicos
- `POST /api/v1/auth/register` — Registrar nuevo donante
- `POST /api/v1/auth/login` — Inicio de sesión (devuelve access + refresh)
- `POST /api/v1/auth/refresh` — Renovar access token
- `GET  /api/v1/donations/track/:trackingId` — Consulta pública por código (HU-02)
- `GET  /api/v1/health` — Estado del servicio y de la DB ✅

### Donante (`donor`)
- `POST /api/v1/donations` — Registrar donación (HU-01)
- `GET  /api/v1/donations/mine` — Listar mis donaciones
- `GET  /api/v1/donations/:id` — Detalle de mi donación
- `DELETE /api/v1/donations/:id` — Cancelar (solo si está en `recibido`)

### Administrador (`admin`)
- `PATCH /api/v1/donations/:id/classify` — Pasar a `clasificado` (HU-03)
- `POST  /api/v1/donations/:id/assign` — Asignar transportista
- `GET   /api/v1/donations` — Listar todas (con filtros)
- `GET   /api/v1/dashboard/metrics` — Métricas (totales, por estado, por tipo)
- `POST  /api/v1/transporters` — Crear cuenta de transportista
- `GET   /api/v1/transporters` — Listar transportistas
- `PATCH /api/v1/transporters/:id/active` — Activar/desactivar

### Transportista (`transporter`)
- `GET   /api/v1/assignments/mine` — Mis asignaciones activas
- `PATCH /api/v1/donations/:id/transit` — Marcar como `en_transito` (HU-04)
- `PATCH /api/v1/donations/:id/deliver` — Confirmar entrega final (HU-05)
- `GET   /api/v1/dashboard/mine` — Mi dashboard (envíos activos / completados)

---

## Historias de usuario

| Código | Historia                                       | Rol           | Prioridad | Estimación |
|--------|------------------------------------------------|---------------|-----------|------------|
| HU-01  | Registro de donación                           | Donante       | 1         | 12 h       |
| HU-02  | Consulta de trazabilidad en tiempo real        | Donante       | 1         | 16 h       |
| HU-03  | Gestión y clasificación de inventario          | Administrador | 2         | 10 h       |
| HU-04  | Actualización de estado de envío               | Transportista | 2         | 14 h       |
| HU-05  | Confirmación de entrega final                  | Admin/Transp. | 1         |  8 h       |

---

## Cómo correr el proyecto

### Requisitos previos
- Node.js >= 18
- Acceso a una base PostgreSQL en Neon (el schema **ya existe**, no requiere migración inicial)
- Variables de entorno configuradas (ver siguiente sección)

### Instalación
```powershell
npm install
```

### Desarrollo (con autoreload)
Lee `.env.development`.
```powershell
npm run dev
```

### Producción
Lee `.env.production`.
```powershell
npm start
```

### Verificar que todo funciona
Una vez iniciado, abra en el navegador:
```
http://localhost:3000/api/v1/health
```
Debe responder con `exito: true` y mostrar la hora del servidor de Neon.

---

## Cómo correr los tests

```powershell
# Suite completa con reporte de cobertura
npm test

# Modo watch (re-corre al guardar)
npm run test:watch

# Linting
npm run lint
```

El reporte de cobertura se genera en `coverage/`. El threshold global está fijado en **70 %** (branches, functions, lines, statements) — un test que baje de eso hace fallar la suite.

---

## Variables de entorno

| Variable                    | Obligatoria | Descripción                                                       |
|-----------------------------|-------------|-------------------------------------------------------------------|
| `NODE_ENV`                  | sí          | `development` \| `production` \| `test`                           |
| `PORT`                      | no          | Puerto HTTP (default 3000)                                        |
| `API_VERSION`               | no          | Prefijo de versión (default `v1`)                                 |
| `DATABASE_URL`              | **sí**      | Connection string completo de Neon (con `sslmode=require`)        |
| `JWT_SECRET`                | **sí**      | Secreto para firmar access tokens (≥ 32 chars aleatorios)         |
| `JWT_EXPIRES_IN`            | no          | Duración del access token (default `15m`)                         |
| `JWT_REFRESH_SECRET`        | **sí**      | Secreto para refresh tokens (distinto del anterior)               |
| `JWT_REFRESH_EXPIRES_IN`    | no          | Duración del refresh (default `7d`)                               |
| `BCRYPT_ROUNDS`             | no          | Rondas de hash (default 10; usar 12 en producción)                |
| `CORS_ORIGIN`               | no          | Orígenes permitidos separados por coma                            |

Use `.env.example` como plantilla. **Nunca** suba `.env.development` ni `.env.production` reales al repositorio (ambos están en `.gitignore`).

---

## Formato estándar de respuestas HTTP

Todas las respuestas siguen este contrato:

```json
{
  "exito": true,
  "mensaje": "Descripción legible para humanos",
  "datos": { },
  "error": null
}
```

En errores:
```json
{
  "exito": false,
  "mensaje": "Algo salió mal",
  "datos": null,
  "error": { "codigo": "CODIGO_MAQUINA", "detalle": "Información extra (oculta en prod)" }
}
```

Usar siempre los helpers de `src/interfaces/http/utils/respuesta.js`: `exito(datos, mensaje)` y `fallo(mensaje, codigo, detalle)`.

---

## Convenciones del equipo

### Git

- Rama principal: `main` (recibe merges solo desde `develop`)
- Rama de integración: `develop`
- Ramas de trabajo: `develop/<nombre-desarrollador>` o `feat/<descripcion>`
- **Nunca** hacer `push` directo a `main` ni a `develop`
- Commits **en español**, formato:
  ```
  tipo(scope): descripción breve en imperativo

  Cuerpo opcional con más contexto.
  ```
  Tipos válidos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

### Código

- JavaScript ES6+ con `async/await` (sin callbacks ni `.then().catch()` anidados)
- Nombres de variables y funciones en **camelCase en español**
- Nombres de archivos en **kebab-case**
- Constantes en **UPPER_SNAKE_CASE**
- Siempre manejar errores con `try/catch` y respuestas HTTP apropiadas
- **Nunca** exponer stack traces en producción (ver `error.middleware.js`)
- Validar entradas en `interfaces/validators/`, validar invariantes de negocio en `domain/` o casos de uso

---

## Seguridad implementada

- ✅ Helmet (headers de seguridad por defecto)
- ✅ CORS con whitelist desde `CORS_ORIGIN`
- ✅ Rate limit global (300 req / 15 min) y específico para auth (10 intentos / 15 min)
- ✅ JWT con access (15 m) + refresh (7 d), issuer fijo `sistratec-api`
- ✅ bcrypt con rounds configurables por ambiente
- ✅ Queries parametrizadas en toda la capa de DB (prevención de SQL injection)
- ✅ Errores nunca filtran stack en producción
- ⏳ express-validator (instalado, pendiente de aplicar en endpoints)
- ⏳ OAuth2 (pendiente — usar Google como proveedor)

---

## Criterios de evaluación académica

El proyecto se evalúa en el curso IC-4810. Estos son los criterios que el backend debe cumplir:

1. **Funcionalidad completa de las 5 historias de usuario** (HU-01 a HU-05)
2. **Clean Architecture** con separación de capas verificable
3. **Cobertura de tests ≥ 70 %** en la lógica de negocio (Jest, configurado en `package.json`)
4. **Autenticación segura** con JWT + bcrypt y autorización por rol
5. **Validación de inputs** en todos los endpoints públicos
6. **Manejo consistente de errores** y respuestas con formato estándar
7. **Variables de entorno** separadas por ambiente (development / production)
8. **Documentación** clara en `CLAUDE.md` y comentarios donde el "porqué" no sea obvio
9. **Convenciones de Git** respetadas (commits en español, ramas por desarrollador, sin pushes directos a main/develop)
10. **Entrega dentro del plazo** (2 semanas desde la fecha de inicio)

---

## Documentación Swagger / OpenAPI

La documentación interactiva está disponible **solo en development**:

```
http://localhost:3000/api/v1/docs
```

En producción, la ruta `/api/v1/docs` no existe — devuelve `404` porque el bloque de Swagger en `app.js` solo se monta cuando `NODE_ENV === 'development'`.

### Cómo documentar un nuevo endpoint

Agrega un bloque JSDoc `@swagger` directamente en el archivo de **rutas** (no en el controller). El bloque va justo encima del `router.get/post/patch/delete(...)`.

**Plantilla completa:**

```js
/**
 * @swagger
 * /ruta/{parametro}:
 *   post:
 *     summary: Una línea que describe qué hace el endpoint
 *     description: >
 *       Descripción más larga si hace falta. Puede ser multilínea.
 *     tags:
 *       - Donante          # Uno de: Público, Donante, Administrador, Transportista
 *     security:
 *       - BearerAuth: []   # Omitir si el endpoint es público (sin auth)
 *     parameters:
 *       - in: path
 *         name: parametro
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Descripción del parámetro de ruta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campo1
 *             properties:
 *               campo1:
 *                 type: string
 *                 example: valor de ejemplo
 *     responses:
 *       201:
 *         description: Recurso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespuestaExito'
 *                 - type: object
 *                   properties:
 *                     datos:
 *                       $ref: '#/components/schemas/Donacion'
 *       400:
 *         $ref: '#/components/responses/ErrorValidacion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *       500:
 *         $ref: '#/components/responses/ErrorServidor'
 */
router.post('/:parametro', autenticar, autorizar('donor'), miController.miAccion);
```

### Reglas de documentación

1. **Siempre documentar el tag correcto** según quién puede llamar el endpoint.
2. **Siempre incluir `security: - BearerAuth: []`** en endpoints protegidos.
3. **Usar `$ref`** para reutilizar schemas (`Donacion`, `Usuario`, etc.) y respuestas de error — no repetir la estructura.
4. **Incluir los 5 códigos de error estándar** (400, 401, 403, 404, 500) en todos los endpoints protegidos. Los públicos al menos 400 y 500.
5. **El bloque `@swagger` va en el archivo de rutas**, no en el controller. Esto mantiene toda la documentación de una ruta en un solo lugar.
6. Los schemas globales (`Donacion`, `Usuario`, `RespuestaExito`, etc.) están definidos en `src/config/swagger.js`. Si necesitas un schema nuevo, agrégalo allí bajo `components.schemas`.

### Schemas disponibles en `$ref`

| Schema                    | Descripción                                        |
|---------------------------|----------------------------------------------------|
| `RespuestaExito`          | Respuesta estándar `{ exito: true, datos, ... }`   |
| `RespuestaError`          | Respuesta estándar `{ exito: false, error, ... }`  |
| `Donacion`                | Entidad completa de donación                       |
| `Usuario`                 | Entidad de usuario (sin passwordHash)              |
| `TrackingEvent`           | Evento de la bitácora de trazabilidad              |
| `DonacionAsignacion`      | Asignación donación ↔ transportista               |
| `CentroAcopio`            | Centro de acopio                                   |
| `TipoDonacion`            | Tipo de bien donado                                |
| `EstadoDonacionEnum`      | Enum: recibido / clasificado / en_transito / entregado |
| `RolEnum`                 | Enum: donor / transporter / admin                  |

### Respuestas reutilizables en `$ref`

| Referencia                          | Código HTTP | Cuándo usar                  |
|-------------------------------------|-------------|------------------------------|
| `responses/NoAutenticado`           | 401         | Token ausente o inválido     |
| `responses/Prohibido`               | 403         | Rol insuficiente             |
| `responses/NoEncontrado`            | 404         | Recurso no existe            |
| `responses/ErrorServidor`           | 500         | Error inesperado del servidor|
| `responses/ErrorValidacion`         | 400         | Input inválido               |

---

## Próximos pasos

1. Pegar la `DATABASE_URL` real de Neon en `.env.development`
2. Generar los secretos JWT con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
3. `npm install`
4. `npm run dev` y verificar `GET /api/v1/health`
5. Empezar a implementar casos de uso: auth → registro de donación (HU-01) → consulta por tracking (HU-02) → etc.
