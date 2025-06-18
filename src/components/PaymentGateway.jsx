import React from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

/**
 * A reusable component to handle PayPal payments.
 * @param {object} props - The component props.
 * @param {number} props.totalPrice - The total price for the transaction.
 * @param {string} props.description - A description of the item being purchased.
 * @param {function} props.onPaymentSuccess - Callback function for a successful payment. Receives PayPal transaction details.
 * @param {function} props.onPaymentError - Callback function for a payment error.
 * @param {function} props.onPaymentCancel - Callback function for when the payment is cancelled.
 */
const PaymentGateway = ({
  totalPrice,
  description,
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel,
}) => {
  // Creates the PayPal order on the client-side
  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          description: description,
          amount: {
            // NOTE: Ensure this currency code matches your PayPal account's currency
            currency_code: "USD",
            value: totalPrice.toFixed(2),
          },
        },
      ],
      intent: "CAPTURE",
    });
  };

  // Handles the approval of the transaction from the PayPal pop-up
  const onApprove = (data, actions) => {
    // This captures the funds from the transaction.
    return actions.order.capture().then((details) => {
      // Pass the successful transaction details back to the parent component
      if (onPaymentSuccess) {
        onPaymentSuccess(details);
      }
    });
  };

  // Generic error handler passed from parent
  const handleError = (err) => {
    if (onPaymentError) {
      onPaymentError(err);
    }
  };

  // Generic cancel handler passed from parent
  const handleCancel = () => {
    if (onPaymentCancel) {
      onPaymentCancel();
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-center text-gray-800 mb-4">
        Pay With PayPal
      </h3>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={handleError}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default PaymentGateway;
