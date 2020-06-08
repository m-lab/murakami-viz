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
MURAKAMI_VIZ_PORT        # The port that the backend is listening on (default: 3000)
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

And start the running processes (with necessary environment variables if not
defined in `.env`):

```
npm run start
```

Additionally, components can be built or started individually using for example
`npm run build:backend`, `npm run start:worker`, etc.

### Docker

TODO

## API

TODO

## License

[<img src="https://www.gnu.org/graphics/agplv3-155x51.png" alt="AGPLv3" >](http://www.gnu.org/licenses/agpl-3.0.html)

Murakami-viz is a free software project licensed under the GNU Affero General
Public License v3.0 (AGPLv3) by [Throneless Tech](https://throneless.tech).
