# End-to-end testing framework Cypress

The application uses Cypress in the GitHub Actions pipeline to test complicated use cases that
require backend, frontend and database functionality.

## How to run the end-to-end tests in GitHub Actions
1. create a pull request to master or push to master (pushing to master is not adviced)

For testing purposes you can change the branch identifier in .github/workflows/end2end_tests.yml to your own branch and run tests by pushing to that

## How to run the end-to-end tests locally
1. Have docker and docker-compose installed
2. Run application startup command
```docker-compose -f docker-compose.dev.yaml up```
3. While the application is running, run command
```npx cypress run```