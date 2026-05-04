# Learning Node.js API

Proyecto de estudio para aprender Node.js en backend con Express, MySQL y Prisma.

## Requisitos

- Node.js 22 o superior
- npm
- Docker y Docker Compose

## Estructura general

- `src/`: código de la API
- `prisma/`: schema y futuras migraciones de Prisma
- `docker-compose.yml`: levanta la API y MySQL
- `Dockerfile`: imagen de la API
- `.env`: variables de entorno locales

## Configuración inicial

1. Instala dependencias:

```bash
npm install
```

2. Revisa tu archivo `.env` en la raíz.

3. Si necesitas un ejemplo, copia `.env.example` a `.env` y ajusta los valores.

## Variables de entorno

Estas son las variables principales que usa el proyecto:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=learning_api
DB_CONNECTION_LIMIT=10
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_USER=appuser
MYSQL_PASSWORD=apppassword
DATABASE_URL="mysql://appuser:apppassword@localhost:3306/learning_api"
```

## Ejecutar en local

### Opción 1: con MySQL local instalado

1. Asegúrate de tener MySQL corriendo en tu máquina.
2. Crea la base de datos indicada en `DB_NAME`.
3. Ajusta `.env` para que coincida con tu usuario y contraseña de MySQL.
4. Levanta la API:

```bash
npm run dev
```

5. Prueba los endpoints:

- `GET http://localhost:3000/`
- `GET http://localhost:3000/api/health`

### Opción 2: API local + MySQL en Docker

1. Levanta solo MySQL con Docker:

```bash
docker compose up mysql
```

2. En otro terminal, levanta la API localmente:

```bash
npm run dev
```

## Ejecutar todo en Docker

1. Construye y levanta los servicios:

```bash
docker compose up --build
```

2. Abre la API en:

- `http://localhost:3000/`
- `http://localhost:3000/api/health`

3. MySQL queda expuesto en:

- `localhost:3306`

## Prisma

Prisma ya está configurado con:

- `prisma/schema.prisma`
- `prisma.config.ts`

Scripts útiles:

```bash
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:studio
```

## Modelo actual

Por ahora el schema incluye un modelo `User` con estos campos:

- `id`
- `name`
- `email`
- `password`
- `created_at`
- `updated_at`
- `deleted_at`

## Notas

- La API actual usa `mysql2` para conexión directa a MySQL.
- Prisma ya está instalado y preparado para migraciones.
- Si cambias de máquina, solo necesitas copiar el repositorio, instalar dependencias y configurar `.env`.

## Endpoints actuales

- `GET /` - mensaje base de la API
- `GET /api/health` - estado general y verificación de DB

