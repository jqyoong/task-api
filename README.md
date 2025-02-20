# Checkbox Task API

## Table Content

- [Checkbox Task API](#checkbox-task-api)
  - [Table Content](#table-content)
  - [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Repo Structure](#repo-structure)
- [System Feature Toggle Types](#system-feature-toggle-types)
- [Precommit Hooks](#precommit-hooks)
- [Migration](#migration)
- [Deployment](#deployment)
- [Thoughts and Improvements](#thoughts-and-improvements)

## Prerequisites

- Nodejs >= 20.11.0 (Recommended to install asdf, see .tool-versions)
- [Docker](https://docs.docker.com/install/)
- [Postgres](https://wiki.postgresql.org/wiki/Homebrew)

# Getting Started

```
// Initialize dependencies for the API module.
$ make init

// If make init is failed due to asdf or brew install package. After settle on
// your end then we can do below.
make i && make up

// If you want to reset the database, you can do below.
make reset

// Start the server on localhost:3000
$ npm start

// run eslint checking
npm run lint
```

# Repo Structure

This repo is to serve `API endpoint`. There are few of the components in the folder as well which will be list down at below with each of their functionality. This repo is also with Swagger OpenAPI documentation ready by starting the app and you will be able to access the documentation at `http://localhost:3000/api/v1/docs`.

1. **ROUTES**: The communicator of our API endpoints, to control the input and output communication of our server. The blueprint of each of the endpoints is based on the `schema (request & reply)` which some of the properties are inherited from `base_schemas`. Consist of components as follow:
   1. `controller`: Route controller.
   2. `schema`: Route related schema input and output.
   3. `index`: Blueprint of the route structure.
2. **SERVICES**: There are two types of services. Repo used in as `common services` and `endpoint based business logic services`.
3. **MODELS**: The models are the representation of the data in the application. Each schemas are represented of each table in the database.
4. **REPOS**: The repository pattern is used to abstract the data access logic from the business logic of the application. Consist of components as follow:
   1. `base.repo.ts`: The base repository.
   2. `tasks.repo.ts`: The repository that focus the data access layer on `Tasks` table. So in the future if we are to change the database, we only need to change the repository that focus on the new table. Even further extend to discussed topic of high performant application we can implement `Redis` as intecept layer before query to our database.
5. **HELPERS**: Utilities and functions which will help everyone in the team to code happier :D.
6. **LOCALES**: The locales is the localization of the application. When `Accept-Language` header is provided, the application will return respectively error message based on the language and `SUPPORTED_LOCALES` defined in the config. Of course you will need to create new file in the `locales` folder for new language example: `vn-VN.json`.
7. **CONFIGS**: Configuration related to start the application.
   - `db.js`: Blueprint of the DB configurations.
   - `dev.json`: As the system ENV import hierarchy. `Command-line arguments` > `Environment variables` > `development.json`. That being said, you can have a `.env` file to override the `development.json` when running the application locally.
   - `nconf`: A minor modification and the way how we import the environment variables.
8. **TEST**: Each of the _.js file should have a corresponding `_.test.ts` unit test.

# System Feature Toggle Types

1. `nconf.get()`: feature toggle, tie to system when it is up and running. Usually use on very important configuration. Example: Database configuration. 0 latency
2. `Configuration`: table feature toggle, usually use on API, worker configuration if it is depend on each country. Example: API endpoint type of server configuration. Few MS latency.

# Precommit Hooks

This repo also using `husky` and `lint-staged` to integrate with `pre-commit` hook to run `prettier` and `eslint` before commit our local files.

# Migration

```
// Create a new migration
$ npm run migrate:add
```

```
// Run migration
$ npm run migrate:db
```

```
// Rollback migration to last batch
$ npm run migrate:undo
```

# Deployment

This repo is using `Docker` to containerize the application. We can connect with Copilot to deploy the application with Github Action.

```
// Build the docker image
$ npm run build
```

# Thoughts and Improvements

Due to time constraints, and the intention is to have a code review session. So most of the codebase in here is to show case of how the overall structures is going to be.

1. For the highlighted risk part. Here are few of the improvements that can be done:
   - Add `Redis` as intercept cache layer before query to our database to improve the performance of the application.
   - Redesign the `Create New Task` flow to be queuable in `Redis` cache and process by worker or even go further to microservice this into a event driven architecture service.
2. The Infra and monitoring setup is not connected up yet. But I can do it upon request if needed.
3. I have only done one unit test for the `Utilities.test.ts` for demonstration purpose.
