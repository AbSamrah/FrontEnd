import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Configuration for the PayPal script
const initialOptions = {
  "client-id":
    "ATGmZmy8BWcGaRGBWCIsTjFeu8lHufNKIRlkqExo4bbHWhgmgHuM2wsgtdefcIFMT3519itFRsudvDNJ", // IMPORTANT: Replace with your actual Sandbox Client ID
  currency: "USD", // You can change this to EUR or other currencies
  intent: "capture",
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <PayPalScriptProvider options={initialOptions}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PayPalScriptProvider>
  </React.StrictMode>
);

reportWebVitals();
