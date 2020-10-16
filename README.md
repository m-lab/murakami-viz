# Murakami Viz

A visualization service of Murakami tests using Koa and React.

## Requirements

- [Node.js](https://nodejs.org) of version `>=12`
- `npm`

## Structure

Murakami-viz is composed of 2 different parts:

- A [React](https://reactjs.org/)-based **frontend**.
- A [Koa](https://koajs.com)-based **backend** that renders & serves the
  frontend and exposes an API used by the frontend.

These parts are located here in this repository:

```
src/backend  # The backend components
src/common   # Common code and assets
src/frontend # The React frontend
```

## Configuration

Murakami-viz is configured via variables either specified in the environment or
defined in a `.env` file (see `env.example` for an example configuration that
may be edited and copied to `.env`).

The backend parses the following configuration variables:

```
MURAKAMI_VIZ_PORT            # The port that the backend is listening on (default: 3000)
MURAKAMI_VIZ_LOG_LEVEL       # Logging level (default: error)
MURAKAMI_VIZ_HOST            # The host Murakami-viz runs on (default: localhost)
MURAKAMI_VIZ_PORT            # The port to bind to (default: 3000)
MURAKAMI_VIZ_ADMIN_USERNAME  # The administrative user (default: 'admin')
MURAKAMI_VIZ_ADMIN_PASSWORD  # The administrative password
MURAKAMI_VIZ_DB_HOST         # Postgres database host (default: localhost)
MURAKAMI_VIZ_DB_PORT         # Postgres port (default: 5432)
MURAKAMI_VIZ_DB_DATABASE     # Postgres database name (default: murakami)
MURAKAMI_VIZ_DB_USERNAME     # Postgres user (default: murakami)
MURAKAMI_VIZ_DB_PASSWORD     # Postgres password
MURAKAMI_VIZ_DB_POOL_MIN     # Postgres minimum connections (default: 0)
MURAKAMI_VIZ_DB_POOL_MAX     # Postgres max connections (default: 10)
MURAKAMI_VIZ_DB_TIMEOUT      # Postgres connection timeout (default: 0)
```

Additionally, we use the semi-standard `NODE_ENV` variable for defining test,
staging, and production.

## Deployment

### Standalone

First, clone this repository and from the root of the resulting directory
install Murakami-viz's dependencies:

```
npm install
```

Then, build all components:

```
npm run build
```

Create the database:

```
npm run db:migrations
```

and to optionally populate it with test data:

```
npm run db:seeds
```

And start the running processes (with necessary environment variables if not
defined in `.env`):

```
npm run start
```

(use `npm run start:dev` to run in development mode)

### Docker

You can deploy this tool using [Docker](https://docker.io). There is an included `docker-compose.yml` file that will allow you to run it in a production configuration. First, clone the repo and from this directory run docker-compose:

```
docker-compose up --build -d
```

This will build the docker container from the current repository, download the official Postgres docker image, and configure them both (the `-d` flag will detach from the current shell so that you can leave it running, but you can omit it in order to leave the log output attached).

If this is the first time you've run it on this system, you'll want to run the database migrations to initialize the database:

```
docker-compose run murakami npm run db:migrations
```

and then optionally seed the database with a default admin user:

```
docker-compose run murakami npm run db:seeds
```

By default, it runs on [http://localhost:3000](http://localhost:3000), but you can place it behind a proxy such as [Nginx](https://nginx.com) in order to provide TLS support and other features.

## License

Murakami-viz is an open-source software project licensed under the Apache License v2.0 by [Measurement Lab](https://measurementlab.net) and [Throneless Tech](https://throneless.tech).
