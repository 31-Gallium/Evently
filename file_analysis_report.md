# File Analysis Report

This report details the purpose, location, and connections of each file in the Evently project.

## Project Structure Overview

The project is a monorepo with two main parts: a `client` directory for the React frontend and a `server` directory for the Node.js backend.

-   **`client/`**: Contains the React application, including components, pages, stores (for Zustand state management), and other related files.
-   **`server/`**: Contains the Express.js backend, including the API server, Prisma schema for the database, and tests.
-   **Root Directory**: Contains configuration files for the entire project.

---

## Root Directory

### `package.json`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\package.json`
-   **Purpose**: Defines the dependencies for the root of the project. It seems to contain some frontend dependencies that might be duplicates of those in the `client` directory.
-   **Connections**: This file is used by `npm` to install dependencies.

### `package-lock.json`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\package-lock.json`
-   **Purpose**: Records the exact versions of the dependencies used in the root of the project, ensuring consistent installations.
-   **Connections**: Used by `npm` during the installation process.

### `GEMINI.md`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\GEMINI.md`
-   **Purpose**: Provides a high-level overview of the project, including its architecture, technologies, and instructions for building and running the application.
-   **Connections**: This file is for informational purposes and is not directly connected to the application's code.

### `Software_Engineering_Report.md`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\Software_Engineering_Report.md`
-   **Purpose**: A detailed report on the software engineering aspects of the project, including requirements, design, and testing.
-   **Connections**: This file is for documentation and is not connected to the application's code.

---

## `client/` Directory

### `client/.gitignore`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\client\.gitignore`
-   **Purpose**: Specifies which files and directories should be ignored by Git in the `client` directory, such as `node_modules` and `build`.
-   **Connections**: Used by Git.

### `client/package.json`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\client\package.json`
-   **Purpose**: Defines the dependencies and scripts for the React client application. It lists libraries like `react`, `react-router-dom`, `zustand`, and `firebase`.
-   **Connections**: Used by `npm` to manage the client's dependencies and run scripts like `start`, `build`, and `test`.

### `client/README.md`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\client\README.md`
-   **Purpose**: Provides instructions and information about the React client application, bootstrapped with Create React App.
-   **Connections**: Informational file.

### `client/src/App.jsx`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\client\src\App.jsx`
-   **Purpose**: The main component of the React application. It sets up the routing using `react-router-dom` and defines the application's page structure.
-   **Connections**:
    -   Imports `BrowserRouter`, `Routes`, `Route`, and `Navigate` from `react-router-dom`.
    -   Imports various page components from the `pages/` directory.
    -   Imports the `Layout` and `ProtectedRoute` components.
    -   Uses the `useAuth` hook from `context/AuthContext.jsx`.
    -   Imports and uses several Zustand stores from the `store/` directory.

### `client/src/index.js`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\client\src\index.js`
-   **Purpose**: The entry point of the React application. It renders the `App` component into the DOM.
-   **Connections**:
    -   Imports `React` and `ReactDOM`.
    -   Imports the `App` component.
    -   Wraps the `App` component with the `AuthProvider` from `context/AuthContext.jsx`.

### `client/src/firebase.js`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\client\src\firebase.js`
-   **Purpose**: Initializes the Firebase application with the provided configuration.
-   **Connections**:
    -   Imports `initializeApp` from `firebase/app` and `getAuth` from `firebase/auth`.
    -   Exports the `auth` object, which is used for authentication throughout the client application.

### `client/src/context/AuthContext.jsx`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\client\src\context\AuthContext.jsx`
-   **Purpose**: Provides an authentication context for the entire application, managing the user's authentication state.
-   **Connections**:
    -   Uses `onAuthStateChanged` from `firebase/auth` to listen for authentication state changes.
    -   Provides the `useAuth` hook, which is used by many components to access the current user's information.

### `client/src/store/*.js`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\client\src\store\`
-   **Purpose**: These files define the Zustand stores for managing the application's state, such as events and categories.
-   **Connections**: Each store fetches data from the backend API and provides state and actions to the components that use them.

### `client/src/pages/*.jsx`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\client\src\pages\`
-   **Purpose**: These files define the different pages of the application, such as the home page, event details page, and dashboard.
-   **Connections**: They are rendered by the `App` component's router and often use components from the `components/` directory and stores from the `store/` directory.

### `client/src/components/**/*.jsx`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\client\src\components\`
-   **Purpose**: These files define reusable UI components used throughout the application, such as calendars, charts, cards, and forms.
-   **Connections**: They are imported and used by the page components in the `pages/` directory.

---

## `server/` Directory

### `server/package.json`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\server\package.json`
-   **Purpose**: Defines the dependencies and scripts for the Node.js backend server. It lists libraries like `express`, `prisma`, `cors`, and `firebase-admin`.
-   **Connections**: Used by `npm` to manage the server's dependencies and run scripts like `start`, `dev`, and `test`.

### `server/src/server.js`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\server\src\server.js`
-   **Purpose**: The main file for the Express.js server. It defines the API endpoints, middleware, and error handling.
-   **Connections**:
    -   Imports `express`, `cors`, and `dotenv`.
    -   Initializes the `PrismaClient`.
    -   Defines middleware for authentication (`verifyFirebaseToken`) and authorization (`isAdmin`, `isOrganizer`).
    -   Defines all the API routes for the application.

### `server/src/index.js`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\server\src\index.js`
-   **Purpose**: The entry point for the backend server. It initializes the Firebase Admin SDK and starts the Express server.
-   **Connections**:
    -   Imports the `createApp` function from `server.js`.
    -   Initializes `firebase-admin`.
    -   Starts the server on the specified port.

### `server/prisma/schema.prisma`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\server\prisma\schema.prisma`
-   **Purpose**: Defines the database schema for the application, including the models for `User`, `Event`, `Booking`, and other related tables.
-   **Connections**: Used by Prisma to generate the Prisma Client and to manage database migrations.

### `server/prisma/seed.js`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\server\prisma\seed.js`
-   **Purpose**: A script to seed the database with initial data for development and testing.
-   **Connections**: Uses the Prisma Client to create users and events in the database.

### `server/__tests__/*.js`

-   **Location**: `C:\Users\Base\Desktop\Seb\evently-project\server\__tests__\`
-   **Purpose**: These files contain Jest tests for the backend API, covering admin, event, and user-related endpoints.
-   **Connections**: They use `supertest` to make requests to the API and `jest` to run the tests.
