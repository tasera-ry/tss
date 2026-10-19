# End-to-end testing with Cypress

Cypress tests exercise application workflows that involve the frontend, backend, and database. Test specs are in `test/cypress/e2e`.

## Run locally

1. Install Docker and Docker Compose.
2. From the repository root, start the application:

   ```sh
   docker compose -f docker-compose.dev.yaml up --build
   ```

3. In another terminal, run Cypress from the `test` directory:

   ```sh
   cd test
   npx cypress run
   ```

To open the interactive runner, run `npx cypress open` from `test`.

## GitHub Actions

The `end2end_tests.yml` workflow starts the development Compose stack and runs Cypress on pushes and pull requests targeting `master`.
