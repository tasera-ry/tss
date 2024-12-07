# Tasera Scheduling Software

[![Frontend Unit Test Run](https://github.com/tasera-ry/tss/actions/workflows/frontend_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/frontend_tests.yml)
[![Backend Unit Test Run](https://github.com/tasera-ry/tss/actions/workflows/backend_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/backend_tests.yml)
[![Cypress Test Run](https://github.com/tasera-ry/tss/actions/workflows/end2end_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/end2end_tests.yml)
[![Publish Docker image](https://github.com/tasera-ry/tss/actions/workflows/build_docker.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/build_docker.yml)

## About

Program for management and scheduling of Tasera managed shooting ranges in Pirkanmaa area.

## Dependencies

| Name       | Version |
|:-----------|--------:|
| Node.js    | 20+     |
| PostgreSQL | 13+      |

## How to run the application (development)
## New easier way of running
1. Have docker and docker-compose installed
2. Run command
```docker-compose -f docker-compose.dev.yaml up```
3. Done! Frontend bound on host port 3000, backend on 8000.
## First steps
1. Install project dependencies
   - https://nodejs.org/ (tested using the `LTS 20` release)
   - https://www.postgresql.org/

     Easiest way to set up a PSQL database is using docker:
     ```sh
     docker run --env POSTGRES_PASSWORD=some_password -d -p 5432:5432 postgres:12
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

## How to run the application (production)
1. Run steps 1., 2., & 3. from the previous section
2. Build react image
   ```sh
   cd front && npm run build && cd ..
   ```

   You can then copy the resulting files located inside `/front/build` to some
   servers public html directory and route calls to `/api/*` to this server, or
   let the express backend handle serving both the HTML and REST calls.

3. Run database migrations
   ```sh
   env DB_USER=postgres \
       DB_PASSWORD=some_password \
       DB=postgres \
       NODE_ENV=stable \
       sh -c 'cd back && npx knex migrate:latest && npx knex seed:run && cd ..'
   ```
4. Run the project
   ```sh
   env DB_USER=postgres \
       DB_PASSWORD=some_password \
       DB=postgres \
       NODE_ENV=stable \
       SENDER_EMAIL=noreply@tasera.fi \
       bash -c 'cd back && npm start'
   ```

   A systemd unit file is also provided, though it requires some manual
   configuration, symlink it inside the host machines systemd unit file
   directory and run `systemctl start tasera-scheduling-software.service` to
   run.

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

### Cypress tests

[![Cypress Test Run](https://github.com/tasera-ry/tss/actions/workflows/end2end_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/end2end_tests.yml)

Cypress tests have been created, but the Github workflow for them is disabled.
- See comments in end2end_tests.yml.


### Docker Production Image

[![Publish Docker image](https://github.com/tasera-ry/tss/actions/workflows/build_docker.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/build_docker.yml)


# Spring 2021 Team
RK
AV
LM
KK



PR


## Tss development users
See seeds/02_users.js for the development environment users.

## Cypress tests
Automated UI tests can be run with cypress in the /back/cypress -folder. Navigate to /back folder, and run `npm install cypress` and `npm run cy:open`. This will open cypress console, where tests can be run by clicking on the test suite file names.
