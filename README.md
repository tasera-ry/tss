# Tasera Scheduling Software

[![Frontend Unit Test Run](https://github.com/tasera-ry/tss/actions/workflows/frontend_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/frontend_tests.yml)
[![Backend Unit Test Run](https://github.com/tasera-ry/tss/actions/workflows/backend_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/backend_tests.yml)
[![Cypress Test Run](https://github.com/tasera-ry/tss/actions/workflows/end2end_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/end2end_tests.yml)
[![Publish Docker image](https://github.com/tasera-ry/tss/actions/workflows/build_docker.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/build_docker.yml)

## Index

- [Index](#index)
- [About](#about)
- [Dependencies](#dependencies)
- [Running the application with Docker Compose](#running-the-application-with-docker-compose)
   - [Development](#development)
   - [Production test](#production-test)
   - [Production](#production)
- [Running without docker compose (development)](#running-without-docker-compose-development)
   - [First steps](#first-steps)
   - [Starting up the app using an .env file](#starting-up-the-app-using-an-env-file)
- [Runtime configuration](#runtime-configuration)
- [Automatic CI/CD Workflows](#automatic-cicd-workflows)
   - [Frontend tests](#frontend-tests)
   - [Backend tests](#backend-tests)
   - [Cypress tests](#cypress-tests)
   - [Docker Production Image](#docker-production-image)

## About

Program for management and scheduling of Tasera managed shooting ranges in Pirkanmaa area.

## Dependencies

| Name       | Version |
|:-----------|--------:|
| Node.js    | 20+     |
| PostgreSQL | 13+      |

## Running the application with Docker Compose

### Development
1. Have docker and docker-compose installed
2. Run command
   ```sh
   docker-compose -f docker-compose.dev.yaml up
   ```
3. Done! Frontend bound on host port 3000, backend on 8000.

#### Note!
Using Docker this way may cause unexpected *"works on my machine"* type issues. **Deleting containers, images, volumes** and `node_modules` folder usually fix these issues, but a dedicated enviroment would be preferable.

Config for seed data is set plus minus one year in back/config/config.js 

### Production test

This assumes a database already exists and can be mounted. The path and credentials are defined in `test_env_variables.env`.

```sh
docker-compose --env-file test_env_variables.env -f production-test-compose.yaml up
```

### Production
This assumes a database already exists and can be mounted. The path and credentials are defined in `env_variables.env`. Use strong passwords for production enviroment. The `test_env_variables.env` is an example of a valid `.env` and can be used as a template.

```sh
docker-compose --env-file env_variables.env -f production-compose.yaml up
```

---

## Running without docker compose (development)

### First steps
1. Install project dependencies
   - https://nodejs.org/ (tested using the `LTS 20` release)
   - https://www.postgresql.org/

     Easiest way to set up a PSQL database is using docker:
     ```sh
     docker run --env POSTGRES_PASSWORD=some_password -d -p 5432:5432 postgres:14
     ```
2. Clone this repository
   - `git clone https://github.com/tasera-ry/tss.git`
3. Install project packages
   - `cd back && npm install && cd ../front && npm install && cd ..`

### Starting up the app using an .env file
1. Create a `.env` file into the `back/` directory (an .env.example file is included in the folder, which can be copied and renamed).
2. Write the runtime variables into the `.env` file.
3. When using `.env` file you can run the commands without the environment variables,
4. Migrations and seeds
   ```sh
       bash -c 'cd back && npx knex migrate:latest && npx knex seed:run && cd ..
   ```
5. Run the project
   ```sh
      bash -c 'cd back && npm run dev:withFront'
   ```
6. The application should start at http://localhost:3000 (default host)

### Starting the app with command line variables
1. Run database migrations
   ```sh
   env DB_USER=postgres \
       DB_PASSWORD=some_password \
       DB=postgres \
       bash -c 'cd back && npx knex migrate:latest && npx knex seed:run && cd ..'
   ```
2. Run the project
   ```sh
   env DB_USER=postgres \
       DB_PASSWORD=some_password \
       DB=postgres \
       SENDER_EMAIL=noreply@tasera.fi \
       bash -c 'cd back && npm run dev:withFront'
   ```
3. The program should start up at http://localhost:3000 (default host)

## Runtime configuration
**NOTE** These can be also set in a `.env` file in the `back/` directory.

| Variable        | Explanation                                                            | Default value           |
|-----------------|------------------------------------------------------------------------|-------------------------|
| `DB`            | Database name                                                          | undefined               |
| `DB_HOST`       | Database address                                                       | `127.0.0.1`             |
| `DB_USER`       | Database owner                                                         | `tssuser`               |
| `DB_PASSWORD`   | Database owner's password                                              | undefined               |
| `SENDER_EMAIL`  | Email address that will be used to send emails                         | undefined               |
| `EMAIL_HOST`    | Host that will be used to send emails                                  | undefined               |
| `EMAIL_PORT`    | Port that will be used to send emails                                  | undefined               |
| `EMAIL_CC`      | Email address where copy of the email will be sent                     | undefined               |
| `EMAIL_SECURE`  | Email secure option                                                    | undefined               |
| `EMAIL_USER`    | Email username that will be used to send email. Optional               | undefined               |
| `EMAIL_PASSWORD`| Password for Email user. Optional                                      | undefined               |
| `DB_DEBUG`      | Enable database debug calls by setting to true                         | `false`                 |
| `NODE_ENV`      | Control the mode the backend runs in, either `development` or `stable` | `development`           |
| `SERVER_HOST`   | Manually set hostname                                                  | `http://localhost:3000` |
| `JWT_SECRET`    | Secret key used to sign JSON Web Tokens                                | Random on startup       |

## Automatic CI/CD Workflows

### Frontend tests

[![Frontend Unit Test Run](https://github.com/tasera-ry/tss/actions/workflows/frontend_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/frontend_tests.yml)

Frontend tests are run automatically.

Due to running out of time to fix the tests, some tests have been skipped in:
```
   front/src/TrackStatistics/TrackStatistics.test.js
   front/src/edittracks/tracks.test.js
   front/src/scheduling/Scheduling.test.js
   front/src/tabletview/rangeofficer.test.js
   front/src/usermanagement/UserManagementView.test.js
```

There are some common themes to the broken tests.

Common errors are:

```
MUI: The `styles` argument provided is invalid
```

```
Unable to find an element by: [data-testid="___"]
```

### Backend tests

[![Backend Unit Test Run](https://github.com/tasera-ry/tss/actions/workflows/backend_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/backend_tests.yml)

Backend tests are run automatically.

### Cypress tests

[![Cypress Test Run](https://github.com/tasera-ry/tss/actions/workflows/end2end_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/end2end_tests.yml)

Cypress tests have been created, but the Github workflow for them is disabled.
- See comments in end2end_tests.yml.

#### You can run the tests manually:
Navigate to /back folder, and run `npm install cypress` and `npm run cy:open`. This will open cypress console, where tests can be run by clicking on the test suite file names.

### Docker Production Image

[![Publish Docker image](https://github.com/tasera-ry/tss/actions/workflows/build_docker.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/build_docker.yml)

Production image is automatically built every time code is merged to `master`. A test image is built every time code is merged to any `v*_-develop` branch. Unique tags are generated for builds created using the GitHub release feature.

The latest production image is always available at
```
ghcr.io/tasera-ry/tss:master
```

Individual production images are avaliable by their release tag, such as:
```
ghcr.io/tasera-ry/tss:7.0.0
```

#### Releases

Tagged release images are created, when a release is created through GitHub. Using this feature is useful, in order to allow roll back, in case of a broken release.

#### Test images

The latest build is always avalable with the `latest` tag.
```
ghcr.io/tasera-ry/tss:latest
```

Both push, and pull request to v*-develop branches triggers a new build:
```
ghcr.io/tasera-ry/tss:{branch name}
```
