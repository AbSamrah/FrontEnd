import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom"; // Import ReactDOM
import { useParams, useLocation, useNavigate } from "react-router-dom";
import apiClient from "../helper/apiclient";

// A new component to encapsulate PayPal's button logic
const PayPalButtonWrapper = ({
  bookingId,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const createOrder = async () => {
    try {
      const response = await apiClient.post(
        `/paypal/create-order/${bookingId}`
      );
      if (response.data.orderId) {
        return response.data.orderId;
      }
      throw new Error("Could not retrieve PayPal order ID from server.");
    } catch (err) {
      onPaymentError("Failed to create PayPal order. Please try again.");
      return null;
    }
  };

  const onApprove = async (data) => {
    try {
      // Use the endpoint from your PaymentTransactionController
      const response = await apiClient.post(
        `/paymenttransaction/${data.orderID}/capture`
      );
      onPaymentSuccess(data.orderID);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Payment capture failed. Please contact support.";
      onPaymentError(errorMessage);
    }
  };

  // Check if PayPal SDK is loaded
  // Note: The paypal object might not be available on the window immediately.
  // A robust solution might involve loading the script dynamically or using a library like @paypal/react-paypal-js
  if (!window.paypal) {
    return (
      <div className="text-center text-red-500">
        Loading PayPal script... If this persists, please refresh.
      </div>
    );
  }

  // Render the PayPal buttons
  const PayPalButtons = window.paypal.Buttons.driver("react", {
    React,
    ReactDOM,
  });
  return (
    <PayPalButtons
      createOrder={createOrder}
      onApprove={onApprove}
      onError={(err) =>
        onPaymentError("An unexpected error occurred with PayPal.")
      }
      onCancel={() => onPaymentError("Payment was cancelled.")}
    />
  );
};

const PaymentPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { totalPrice } = location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("paypal"); // Default to paypal

  useEffect(() => {
    if (!totalPrice || !bookingId) {
      navigate("/cars");
    }
  }, [bookingId, totalPrice, navigate]);

  const handlePaymentSuccess = (orderId) => {
    navigate("/payment-success", { state: { orderId } });
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    if (errorMessage === "Payment was cancelled.") {
      navigate("/payment-cancel");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Complete Your Payment
            </h2>
            <div className="text-center mt-4 text-gray-600">
              <p className="text-lg">Total Amount</p>
              <p className="text-4xl font-bold text-blue-600">
                €{totalPrice?.toFixed(2)}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md my-4 text-sm">
              {error}
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-medium text-center text-gray-800 mb-4">
              Choose a Payment Method
            </h3>

            {/* Method Selection */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={() => setSelectedMethod("paypal")}
                className={`p-4 border rounded-lg ${selectedMethod === "paypal" ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-300"}`}>
                <i className="fab fa-paypal fa-2x text-[#00457C]"></i>
              </button>
              <button
                onClick={() => setSelectedMethod("stripe")}
                className={`p-4 border rounded-lg ${selectedMethod === "stripe" ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-300"}`}>
                <i className="fab fa-stripe-s fa-2x text-[#635BFF]"></i>
              </button>
            </div>

            {/* Payment Button Area */}
            <div className="h-20 flex items-center justify-center">
              {selectedMethod === "paypal" && (
                <PayPalButtonWrapper
                  bookingId={bookingId}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              )}
              {selectedMethod === "stripe" && (
                <button
                  onClick={() =>
                    alert("Stripe payment is not yet implemented.")
                  }
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#635BFF] hover:bg-[#534dff]">
                  Pay with Stripe
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-blue-500">
            &larr; Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
