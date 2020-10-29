# Tasera Scheduling Software

## About

Program for management and scheduling of Tasera managed shooting ranges in Pirkanmaa area.

## Dependencies

| Name       | Version |
|:-----------|--------:|
| Node.js    | 12+     |
| PostgreSQL | 9+      |

## How to run the application (development)

1. Install project dependencies
   - https://nodejs.org/ (tested using the `LTS 12` release)
   - https://www.postgresql.org/

     Easiest way to set up a PSQL database is using docker:
     ```sh
     docker run --env POSTGRES_PASSWORD=some_password -d -p 5432:5432 postgres:12
     ```
2. Clone this repository
   - `git clone https://github.com/tasera-ry/tss.git`
3. Install project packages
   - `cd back && npm install && cd ../front && npm install && cd ..`
4. Run database migrations
   ```sh
   env DB_USER=postgres \
       DB_PASSWORD=some_password \
       DB=postgres \
       sh -c 'cd back && npx knex migrate:latest && npx knex seed:run && cd ..'
   ```
5. Run the project
   ```sh
   env DB_USER=postgres \
       DB_PASSWORD=some_password \
       DB=postgres \
       bash -c 'cd back && npm run dev:withFront'
   ```
6. The program should start up

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
       sh -c 'npx knex migrate:latest && npx knex seed:run'
   ```
4. Run the project
   ```sh
   env DB_USER=postgres \
       DB_PASSWORD=some_password \
       DB=postgres \
       NODE_ENV=stable \
       npm start
   ```

   A systemd unit file is also provided, though it requires some manual
   configuration, symlink it inside the host machines systemd unit file
   directory and run `systemctl start tasera-scheduling-software.service` to
   run.

## Runtime configuration

| Variable      | Explanation                                                            | Default value           |
|---------------|------------------------------------------------------------------------|-------------------------|
| `DB`          | Database name                                                          | undefined               |
| `DB_HOST`     | Database address                                                       | `127.0.0.1`             |
| `DB_USER`     | Database owner                                                         | `tssuser`               |
| `DB_PASSWORD` | Database owner's password                                              | undefined               |
| `DB_DEBUG`    | Enable database debug calls by setting to true                         | `false`                 |
| `NODE_ENV`    | Control the mode the backend runs in, either `development` or `stable` | `development`           |
| `SERVER_HOST` | Manually set hostname                                                  | `http://localhost:3000` |
| `JWT_SECRET`  | Secret key used to sign JSON Web Tokens                                | Random on startup       |
