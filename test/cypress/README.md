# End-to-end testing framework Cypress

Testing complicated use cases in the application can be tedious to do by hand and Cypress offers a natural language-ish
solution to the problem. If you don't have a lot of experiaence with testing, this caould be a good way to write some
cases for your application. Sample test case is in ./test/cypress/integration/login.spec.js

Cypress only runs cases from this folder unless told otherwise. Jest has been configured to skip this folder.

The application uses Cypress in the GitHub Actions pipeline to test complicated use cases that
require backend, frontend and database functionality. (pipeline disabled 05/22)

## How to run the end-to-end tests in GitHub Actions

1. create a pull request to master or push to master

For testing purposes you can change the branch identifier in .github/workflows/end2end_tests.yml to your own branch and run tests by pushing to that

## How to run the end-to-end tests locally

1. Have docker and docker-compose installed
2. Run application startup command
   `docker-compose -f docker-compose.dev.yaml up`
3. While the application is running, run command
   `npx cypress run`

