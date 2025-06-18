import React from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

const PayPalTest = () => {
  // This function is called when the user clicks the PayPal button.
  // It sets up the details of the transaction, including the amount.
  const createOrder = (data, actions) => {
    console.log("Creating a test order...");
    return actions.order.create({
      purchase_units: [
        {
          description: "Test Item",
          amount: {
            currency_code: "USD",
            value: "10.00", // A fixed amount for testing
          },
        },
      ],
      // Not an actual capture, just a request for payment
      intent: "CAPTURE",
    });
  };

  // This function is called when the user approves the payment on PayPal.
  const onApprove = (data, actions) => {
    console.log("Order approved. Capturing payment...");
    return actions.order.capture().then((details) => {
      // This is where you would typically handle the successful payment,
      // like updating your database. For this test, we'll just log it.
      console.log(
        "Payment Successful! Capture details:",
        details
      );
      alert(
        `Test Payment Successful!\n\nTransaction ID: ${details.id}\nPayer: ${details.payer.name.given_name}`
      );
    });
  };

  // This function is called if an error occurs during the payment process.
  const onError = (err) => {
    console.error("PayPal Checkout Error:", err);
    alert(
      "An error occurred during the PayPal checkout. Check the console for details."
    );
  };

  // This function is called if the user cancels the payment process.
  const onCancel = () => {
    console.log("PayPal payment cancelled by user.");
    alert("Payment Cancelled");
  };

  return (
    <div className="container mx-auto px-4 py-12 pt-28 text-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">PayPal Frontend Test</h1>
        <p className="text-gray-600 mb-6">
          This is an isolated test to check the connection with PayPal. It will
          initiate a fixed payment of $10.00 USD.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Use your PayPal Sandbox account credentials to complete the test.
        </p>
        <div style={{ minHeight: "150px" }}>
          {" "}
          {/* Provide space for the buttons to render */}
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
            onCancel={onCancel}
            style={{ layout: "vertical" }}
          />
        </div>
      </div>
    </div>
  );
};

export default PayPalTest;