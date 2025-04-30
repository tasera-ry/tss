# Tasera Scheduling Software (TSS)

[![Frontend Unit Test Run](https://github.com/tasera-ry/tss/actions/workflows/frontend_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/frontend_tests.yml)
[![Backend Unit Test Run](https://github.com/tasera-ry/tss/actions/workflows/backend_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/backend_tests.yml)
[![Cypress Test Run](https://github.com/tasera-ry/tss/actions/workflows/end2end_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/end2end_tests.yml)
[![Publish Docker image](https://github.com/tasera-ry/tss/actions/workflows/build_docker.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/build_docker.yml)

## Table of Contents

- [Tasera Scheduling Software (TSS)](#tasera-scheduling-software-tss)
  - [Table of Contents](#table-of-contents)
  - [About](#about)
  - [Tech Stack](#tech-stack)
  - [Dependencies](#dependencies)
    - [Using mise for Version Management](#using-mise-for-version-management)
  - [Running the Application](#running-the-application)
    - [Using Docker Compose](#using-docker-compose)
      - [Development](#development)
  - [Production and Staging](#production-and-staging)
    - [Without Docker Compose (Development)](#without-docker-compose-development)
    - [First steps](#first-steps)
    - [Starting up the app using an .env file](#starting-up-the-app-using-an-env-file)
    - [Starting the app with command line variables](#starting-the-app-with-command-line-variables)
  - [Configuration Options](#configuration-options)
  - [Conventions](#conventions)
    - [TypeScript Migration](#typescript-migration)
    - [React Query](#react-query)
    - [Tailwind CSS](#tailwind-css)
    - [UI Component Library](#ui-component-library)
    - [File Structure](#file-structure)
    - [Localization](#localization)
  - [CI/CD Workflows](#cicd-workflows)
    - [Frontend Tests](#frontend-tests)
    - [Backend Tests](#backend-tests)
    - [End-to-End Tests](#end-to-end-tests)
    - [Docker Images](#docker-images)
      - [Releases](#releases)
  - [License](#license)

## About

Tasera Scheduling Software (TSS) is a management system for Tasera-operated shooting range in the Pirkanmaa area. The application provides tools for scheduling, user management, and track statistics tracking.

## Tech Stack

- **Frontend**: React with Material UI, built with Vite
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication
- **Containerization**: Docker and Docker Compose
- **CI/CD**: GitHub Actions

## Dependencies

| Requirement    | Version |
| :------------- | ------: |
| Node.js        |     20+ |
| PostgreSQL     |     13+ |
| Docker         |  Latest |
| Docker Compose |  Latest |

### Using mise for Version Management

This project includes a `.tool-versions` file for use with [mise](https://mise.jdx.dev/), a fast and reliable tool version manager that helps maintain consistent development environments across machines.

To use these exact versions with mise:

1. [Install mise](https://mise.jdx.dev/getting-started.html)
2. Run the following in the project root:
   ```sh
   mise install
   ```

Using mise ensures all developers are working with the same tool versions, reducing "works on my machine" issues. Mise is compatible with `.tool-versions` files and offers improved performance compared to other version managers.

## Running the Application

### Using Docker Compose

The easiest way to run the application is with Docker Compose, which sets up all necessary components automatically.

#### Development

1. Ensure Docker and Docker Compose are installed
2. Run the development environment:
   ```sh
   docker-compose -f docker-compose.dev.yaml up
   ```
3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

> **Note:** If you encounter "works on my machine" issues, try removing containers, images, volumes, and the `node_modules` folders before rebuilding.

> **Note:** Config for seed data is set plus minus one year in back/config/config.js

## Production and Staging

Production and staging environments are running on virtual machines using docker-compose.
Staging environment is updated along latest docker image from `master` branch.
Updates are handled by [watchtower](https://github.com/containrrr/watchtower).

Production environment update is done manually.

---

### Without Docker Compose (Development)

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

## Configuration Options

The following environment variables can be set either in a `.env` file in the `back/` directory or as runtime environment variables:

| Variable         | Description                                  | Default                 |
| ---------------- | -------------------------------------------- | ----------------------- |
| `DB`             | Database name                                | undefined               |
| `DB_HOST`        | Database address                             | `127.0.0.1`             |
| `DB_USER`        | Database username                            | `tssuser`               |
| `DB_PASSWORD`    | Database password                            | undefined               |
| `SENDER_EMAIL`   | Email address used for sending notifications | undefined               |
| `EMAIL_HOST`     | SMTP server hostname                         | undefined               |
| `EMAIL_PORT`     | SMTP server port                             | undefined               |
| `EMAIL_CC`       | Email address to CC on all sent emails       | undefined               |
| `EMAIL_SECURE`   | Whether to use TLS for SMTP (true/false)     | undefined               |
| `EMAIL_USER`     | SMTP authentication username (if required)   | undefined               |
| `EMAIL_PASSWORD` | SMTP authentication password (if required)   | undefined               |
| `DB_DEBUG`       | Enable database query debugging              | `false`                 |
| `NODE_ENV`       | Environment mode (`development` or `stable`) | `development`           |
| `SERVER_HOST`    | Server hostname                              | `http://localhost:3000` |
| `JWT_SECRET`     | Secret key for JWT token generation          | Random on startup       |

## Conventions

This section outlines the coding conventions and technical decisions for the project to maintain consistency and guide ongoing development.

### TypeScript Migration

The project is transitioning from JavaScript to TypeScript to improve code quality, developer experience, and maintainability:

- All new files should be written in TypeScript (`.ts` or `.tsx`)
- Existing JavaScript files should be gradually migrated to TypeScript when substantial changes are made
- TypeScript configuration is in `tsconfig.json` at the root of both frontend and backend
- Type definitions for third-party libraries should be added via DefinitelyTyped (`@types/*`) packages

### React Query

[React Query](https://tanstack.com/query/latest/) is the preferred solution for data fetching, caching, and state management for server state:

- Use React Query hooks for all API requests
- Implement custom hooks that wrap React Query functionality for reusable data-fetching logic
- Follow the pattern of separating query keys and query functions
- Utilize built-in caching, refetching, and invalidation mechanisms

### Tailwind CSS

[Tailwind CSS](https://tailwindcss.com/) is being adopted for styling:

- Use utility classes for component styling
- Create reusable components for consistent UI patterns
- Follow the mobile-first responsive design approach
- Custom design tokens should be configured in `tailwind.config.js`

### UI Component Library

The project is gradually transitioning from Material UI to a custom component library built with Tailwind CSS:

- New components should be built with Tailwind CSS rather than Material UI
- Existing Material UI components should be refactored incrementally
- During transition, maintain consistent look and feel between old and new components
- For complex UI components (modals, dropdowns, etc.), [Radix UI](https://www.radix-ui.com/) is recommended as a headless component solution
- Custom components should be organized in the `components/ui` directory with proper documentation

### File Structure

The project follows these file structure conventions to ensure consistency and maintainability:

- **Pages**: All view components are being moved to the `pages` folder instead of the root
  - Each page should be in its own directory with supporting components
  - Example: `pages/Dashboard/Dashboard.tsx` instead of `Dashboard.tsx` at root
- **lib**: Core functionality is organized within the `lib` directory:
  - **Components**: Reusable components in `lib/components`
    - UI components in `lib/components/ui`
    - Feature-specific components in folders by feature name
  - **Hooks**: Custom hooks in `lib/hooks`
  - **Utils**: Utility functions in `lib/utils`
  - **API**: API-related code in `lib/api`
    - Query functions in `lib/api/queries`
    - Mutation functions in `lib/api/mutations`
  - **Types**: Shared type definitions in `lib/types`

This structure helps with code organization, makes the codebase more navigable, and supports the ongoing TypeScript migration.

### Localization

The application uses [Lingui](https://lingui.dev/) for internationalization (i18n) and localization (l10n) in our React application:

- **Message Catalogs**: Translation files are stored in `src/locales/{lang}/messages.po`
- **Supported Languages**: Finnish (fi), Swedish (sv), and English (en)

> **⚠️ Important:** When using Lingui in React, remember to keep localization reactive:
>
> - `<Trans>` components handle reactivity automatically
> - For programmatic localization, always use the `useLingui()` hook inside components
>
> ```tsx
> // ✅ Correct: Using useLingui() hook
> function MyComponent() {
>   const { t } = useLingui();
>   return <p>{t`Welcome`}</p>;
> }
>
> // ❌ Incorrect: Direct i18n calls
> import { t } from '@lingui/macro';
>
> function MyComponent() {
>   return <p>{t`Welcome`}</p>; // Won't update on language change!
> }
> ```

## CI/CD Workflows

### Frontend Tests

[![Frontend Unit Test Run](https://github.com/tasera-ry/tss/actions/workflows/frontend_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/frontend_tests.yml)

Frontend tests run automatically on every push and pull request. We use Vitest for unit and component testing.

### Backend Tests

[![Backend Unit Test Run](https://github.com/tasera-ry/tss/actions/workflows/backend_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/backend_tests.yml)

Backend tests run automatically on every push and pull request. We use Jest for testing the backend API.

### End-to-End Tests

[![Cypress Test Run](https://github.com/tasera-ry/tss/actions/workflows/end2end_tests.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/end2end_tests.yml)

End-to-end tests are implemented with Cypress and run automatically on every push and pull request via GitHub Actions. The tests are located in the `test` folder at the root of the project.

To run Cypress tests locally:

```sh
cd test && npm install && npm run cypress:open
```

### Docker Images

[![Publish Docker image](https://github.com/tasera-ry/tss/actions/workflows/build_docker.yml/badge.svg)](https://github.com/tasera-ry/tss/actions/workflows/build_docker.yml)

Docker images are automatically built and published to GitHub Container Registry:

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

