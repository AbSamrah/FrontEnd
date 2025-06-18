# TAJS Tour Agency - Frontend

![React](https://img.shields.io/badge/react-%2320232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-informational?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0.2-38B2AC.svg?style=for-the-badge&logo=tailwind-css)
![Status](https://img.shields.io/badge/Status-Proof--of--Concept-yellow.svg?style=for-the-badge)

This is the frontend for the **TAJS Tour Agency**, a modern web application for car rentals and trip bookings. It provides a user-friendly interface for customers to browse, book, and pay, as well as a functional dashboard for administrators and employees to manage the platform's offerings.

**Backend Repository:** [**tarekmineroyal/tajswebproject**](https://github.com/tarekmineroyal/tajswebproject)

## About The Project

This project, built with React and TypeScript, serves as the client-facing interface for the TAJS Tour Agency API. It's a feature-rich Single Page Application (SPA) designed to provide a seamless user experience for booking tours and renting vehicles. The application handles user authentication using JWT and integrates with PayPal for payment processing.

### Key Features

-   **User Authentication**: Secure user registration, login, and session management using JSON Web Tokens (JWT).
-   **Dynamic Routing**: A complete multi-page experience managed by React Router.
-   **Vehicle & Trip Browse**: Dedicated pages for users to browse and view details for available cars and tours.
-   **Role-Based UI**: The user interface adapts based on the logged-in user's role (Customer, Employee, or Admin), showing relevant navigation links and features.
-   **Car & Trip Management**: Admins and Employees have access to dashboards to add, update, and manage car and trip listings.
-   **Booking Management**: (For Admins/Employees) A dedicated view to see and manage car bookings.
-   **Payment Integration**: Securely process payments for bookings using the PayPal REST API via `@paypal/react-paypal-js`.
-   **Form Validation**: Robust client-side validation on forms using Joi-browser.

## Technology Stack

The frontend is built with a modern and robust technology stack:

-   **Framework:** [React](https://react.dev/) (v19)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Routing:** [React Router](https://reactrouter.com/) (v7)
-   **API Communication:** [Axios](https://axios-http.com/)
-   **State Management:** React Context API & Component State
-   **Authentication:** [JWT Decode](https://github.com/auth0/jwt-decode)
-   **Form Validation:** [Joi-browser](https://github.com/hapijs/joi/tree/v13.4.0)
-   **Payment:** [PayPal React SDK](https://github.com/paypal/react-paypal-js)

## Getting Started

To get a local copy of the frontend up and running, follow these steps.

### Prerequisites

-   Node.js (v14.0.0 or higher)
-   npm (or yarn)
-   A running instance of the [backend API](https://github.com/tarekmineroyal/tajswebproject).

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/AbSamrah/FrontEnd.git](https://github.com/AbSamrah/FrontEnd.git)
    cd FrontEnd
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Configure the Backend API Connection:**
    The frontend needs to know where the backend API is running.
    - Create a file named `apiClient.js` inside the `src/helper/` directory.
    - Add the following code, replacing the `baseURL` with the address of your local backend server if it's different.

    ```javascript
    // src/helper/apiclient.js
    import axios from "axios";

    const apiClient = axios.create({
      baseURL: "http://localhost:5117/api", // Make sure this matches your backend URL
    });

    export default apiClient;
    ```

4.  **Configure Environment Variables for PayPal:**
    It is highly recommended to use environment variables for sensitive keys.
    - Create a `.env` file in the root of your project.
    - Add your PayPal Sandbox Client ID to this file.

    ```
    REACT_APP_PAYPAL_CLIENT_ID=YOUR_SANDBOX_CLIENT_ID_HERE
    ```
    - In `src/index.js`, replace the hardcoded `client-id` with the environment variable:
    ```javascript
    // src/index.js

    const initialOptions = {
      "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
      currency: "USD",
      intent: "capture",
    };
    ```

### Available Scripts

In the project directory, you can run:

-   `npm start`
    Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

-   `npm test`
    Launches the test runner in interactive watch mode.

-   `npm run build`
    Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
