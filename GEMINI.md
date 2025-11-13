# Project Overview

This is a full-stack event management application called "Evently". It allows users to browse, book, and manage events. The application consists of a React frontend and a Node.js/Express backend, with a SQLite database managed by Prisma.

## Key Technologies

*   **Frontend:** React, React Router, Zustand, Framer Motion, ECharts
*   **Backend:** Node.js, Express.js, Prisma
*   **Database:** SQLite
*   **Authentication:** Firebase Authentication (planned)

## Architecture

The project is structured as a monorepo with two main components:

*   `client/`: A React single-page application (SPA) that provides the user interface.
*   `server/`: A Node.js/Express API that handles business logic and data persistence.

The client and server communicate via a RESTful API. The client is bootstrapped with `create-react-app`, and the server uses Express.js with Prisma for database access.

# Building and Running

## Client

To run the client application in development mode:

```bash
cd client
npm install
npm start
```

This will start the React development server, and the application will be accessible at `http://localhost:3000`.

To build the client for production:

```bash
cd client
npm run build
```

The production-ready files will be generated in the `client/build` directory.

## Server

To run the server in development mode:

```bash
cd server
npm install
npm run dev
```

This will start the Node.js server with `nodemon`, which will automatically restart the server on file changes. The server will be running on `http://localhost:5000`.

To run the server in production:

```bash
cd server
npm start
```

### Database

The project uses a SQLite database. The database file is located at `server/prisma/dev.db`.

To seed the database with initial data, run the following command:

```bash
cd server
npm run db:seed
```

# Development Conventions

## API Endpoints

The server exposes a RESTful API with the following main resources:

*   `/api/events`: For managing events.
*   `/api/users`: For managing users.
*   `/api/bookings`: For managing event bookings.
*   `/api/admin`: For administrative tasks.
*   `/api/calendar`: For calendar-related operations.

A detailed list of all endpoints can be found in `server/src/server.js`.

## Authentication

The application uses a token-based authentication system. The backend expects a Firebase UID in the `x-firebase-uid` header for protected routes. The `verifyFirebaseToken` middleware in `server/src/server.js` is responsible for verifying the token.

## State Management

The client-side application uses Zustand for state management. The main event store is located at `client/src/store/eventStore.js`.

## Code Style

The project does not have a strict code style guide, but it generally follows the standard conventions for React and Node.js development.

## Testing

The client application has a basic test setup using `react-scripts test`. To run the tests:

```bash
cd client
npm test
```

There are no tests implemented for the server-side application.
